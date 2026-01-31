// Prerequisite detection system using LLM when prerequisites aren't explicitly available

import type { ExternalCourse, PrerequisiteAnalysis } from '../types/external-course';
import type { Credential } from '../types/credential';

/**
 * LLM Gateway interface (adapt to your LLM setup)
 */
interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call LLM to detect prerequisites for a course
 * Uses Supabase LLM Gateway Edge Function
 */
async function detectPrerequisitesWithLLM(
  course: ExternalCourse
): Promise<PrerequisiteAnalysis> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found, skipping LLM prerequisite detection');
    return {
      course_id: course.id,
      course_title: course.title,
      prerequisites: [],
      analysis_notes: 'LLM gateway not configured',
    };
  }
  
  try {
    const systemPrompt = `You are an expert in curriculum design and educational prerequisites. 
Analyze courses and identify what knowledge or skills students need before taking them.
Return prerequisites as a JSON array of course titles. Be specific and accurate.`;

    const userPrompt = `What are the prerequisites for this course?

Title: ${course.title}
Subject: ${course.subject || 'Unknown'}
Level: ${course.level || 'Unknown'}
${course.description ? `Description: ${course.description}` : ''}

Return a JSON array of prerequisite course titles. If none are needed, return an empty array.
Format: ["Prerequisite Course 1", "Prerequisite Course 2", ...]`;

    const response = await fetch(`${supabaseUrl}/functions/v1/llm-gateway`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM Gateway error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parse JSON array from response
    let prerequisiteTitles: string[] = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[.*?\]/s);
      if (jsonMatch) {
        prerequisiteTitles = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse entire response as JSON
        prerequisiteTitles = JSON.parse(content);
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract course titles from text
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      prerequisiteTitles = lines
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(title => title.length > 0);
    }

    return {
      course_id: course.id,
      course_title: course.title,
      prerequisites: prerequisiteTitles.map(title => ({
        title,
        confidence: 0.8,
        source: 'llm_detected' as const,
      })),
      analysis_notes: `LLM analysis completed. Found ${prerequisiteTitles.length} prerequisites.`,
    };
  } catch (error) {
    console.error(`Error detecting prerequisites for ${course.title}:`, error);
    return {
      course_id: course.id,
      course_title: course.title,
      prerequisites: [],
      analysis_notes: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Match prerequisite titles to existing microcredentials
 */
function matchPrerequisitesToCredentials(
  prerequisiteTitles: string[],
  credentials: Credential[]
): Array<{
  title: string;
  confidence: number;
  source: 'explicit' | 'llm_detected' | 'inferred';
  microcredential_match?: string;
}> {
  return prerequisiteTitles.map(title => {
    // Try to find exact match
    let match = credentials.find(c => 
      c.title.toLowerCase() === title.toLowerCase()
    );
    
    if (match) {
      return {
        title,
        confidence: 1.0,
        source: 'llm_detected' as const,
        microcredential_match: match.id,
      };
    }
    
    // Try partial match
    const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    match = credentials.find(c => {
      const credWords = c.title.toLowerCase().split(/\s+/);
      const matches = titleWords.filter(w => credWords.includes(w));
      return matches.length >= titleWords.length * 0.6; // 60% word match
    });
    
    if (match) {
      return {
        title,
        confidence: 0.7,
        source: 'llm_detected' as const,
        microcredential_match: match.id,
      };
    }
    
    // No match found
    return {
      title,
      confidence: 0.5,
      source: 'llm_detected' as const,
    };
  });
}

/**
 * Analyze prerequisites for a course
 */
export async function analyzePrerequisites(
  course: ExternalCourse,
  credentials: Credential[],
  useLLM: boolean = true
): Promise<PrerequisiteAnalysis> {
  // If prerequisites are explicitly listed, use them
  if (course.prerequisites && course.prerequisites.length > 0) {
    const matched = matchPrerequisitesToCredentials(course.prerequisites, credentials);
    return {
      course_id: course.id,
      course_title: course.title,
      prerequisites: matched.map(m => ({
        ...m,
        source: 'explicit' as const,
      })),
    };
  }
  
  // If no explicit prerequisites and LLM is enabled, use LLM to detect
  if (useLLM) {
    const llmAnalysis = await detectPrerequisitesWithLLM(course);
    
    // Match LLM-detected prerequisites to credentials
    const matched = matchPrerequisitesToCredentials(
      llmAnalysis.prerequisites.map(p => p.title),
      credentials
    );
    
    return {
      course_id: course.id,
      course_title: course.title,
      prerequisites: matched,
      analysis_notes: llmAnalysis.analysis_notes,
    };
  }
  
  // Fallback: infer prerequisites based on subject and level
  const inferred = inferPrerequisites(course, credentials);
  
  return {
    course_id: course.id,
    course_title: course.title,
    prerequisites: inferred,
    analysis_notes: 'Prerequisites inferred from subject and level patterns',
  };
}

/**
 * Infer prerequisites based on common patterns
 */
function inferPrerequisites(
  course: ExternalCourse,
  credentials: Credential[]
): Array<{
  title: string;
  confidence: number;
  source: 'explicit' | 'llm_detected' | 'inferred';
  microcredential_match?: string;
}> {
  const inferred: Array<{
    title: string;
    confidence: number;
    source: 'inferred';
    microcredential_match?: string;
  }> = [];
  
  // Example: Algebra 2 typically requires Algebra 1
  if (course.title.toLowerCase().includes('algebra 2') || 
      course.title.toLowerCase().includes('algebra ii')) {
    const algebra1 = credentials.find(c => 
      c.title.toLowerCase().includes('algebra') && 
      !c.title.toLowerCase().includes('2') &&
      !c.title.toLowerCase().includes('ii')
    );
    if (algebra1) {
      inferred.push({
        title: algebra1.title,
        confidence: 0.8,
        source: 'inferred',
        microcredential_match: algebra1.id,
      });
    }
  }
  
  // Example: Calculus typically requires Precalculus
  if (course.title.toLowerCase().includes('calculus')) {
    const precalc = credentials.find(c => 
      c.title.toLowerCase().includes('precalculus') ||
      c.title.toLowerCase().includes('pre-calculus')
    );
    if (precalc) {
      inferred.push({
        title: precalc.title,
        confidence: 0.8,
        source: 'inferred',
        microcredential_match: precalc.id,
      });
    }
  }
  
  // Example: Advanced courses typically require foundational courses in same subject
  const levelOrder = ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD'];
  const courseLevelIndex = levelOrder.indexOf(course.level || 'UG');
  
  if (courseLevelIndex > 0) {
    // Find foundational courses in same subject at lower levels
    const collegeMap: Record<string, string> = {
      'Mathematics': 'MATH',
      'Biology': 'NAT',
      'Chemistry': 'NAT',
      'Physics': 'NAT',
      'Computer Science': 'AINS',
    };
    
    const college = collegeMap[course.subject || ''];
    if (college) {
      const foundational = credentials
        .filter(c => {
          const credLevelIndex = levelOrder.indexOf(c.level_band);
          return c.college_primary === college && 
                 credLevelIndex < courseLevelIndex &&
                 credLevelIndex >= courseLevelIndex - 2; // Within 2 levels
        })
        .slice(0, 2); // Take up to 2 foundational courses
      
      foundational.forEach(c => {
        inferred.push({
          title: c.title,
          confidence: 0.6,
          source: 'inferred',
          microcredential_match: c.id,
        });
      });
    }
  }
  
  return inferred;
}

/**
 * Batch analyze prerequisites for multiple courses
 */
export async function batchAnalyzePrerequisites(
  courses: ExternalCourse[],
  credentials: Credential[],
  useLLM: boolean = true
): Promise<PrerequisiteAnalysis[]> {
  const results: PrerequisiteAnalysis[] = [];
  
  for (const course of courses) {
    try {
      const analysis = await analyzePrerequisites(course, credentials, useLLM);
      results.push(analysis);
      
      // Rate limiting: wait 1 second between LLM calls
      if (useLLM && !course.prerequisites) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error analyzing prerequisites for ${course.title}:`, error);
      results.push({
        course_id: course.id,
        course_title: course.title,
        prerequisites: [],
        analysis_notes: `Error: ${error}`,
      });
    }
  }
  
  return results;
}
