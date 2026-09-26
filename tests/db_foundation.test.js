/**
 * AURA OS — Comprehensive Database Foundation & Logic Verification Test
 * 
 * Verifies:
 * 1. Live Supabase database read of subjects, topics, and questions
 * 2. Brand new user starts at 0% across all curriculum topics
 * 3. Topic completion requires correct answer (incorrect answer leaves completed = false)
 * 4. Dynamic progress calculation: completed / total * 100
 * 5. User data isolation between User A and User B
 * 6. Project creation, status change, task progress, and archive/delete
 * 7. Analytics event telemetry starting at 0 and computing dynamically
 * 8. Focus sessions and coding sessions starting at 0
 */

// Simple localStorage mock for node test environment
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};

// Polyfill window / import.meta
global.window = {
  location: { pathname: '/workspace' },
  addEventListener: () => {}
};

async function runTests() {
  console.log('========================================================');
  console.log('AURA OS — COMPLETE DATABASE FOUNDATION VERIFICATION SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Test Live Supabase Connectivity & Shared Curriculum
  console.log('--- TEST 1: Live Supabase Database Connection & Curriculum ---');
  const { learningService } = await import('../src/data/learningService.js');
  const { supabase, isSupabaseConfigured } = await import('../src/data/supabaseClient.js');

  assert(isSupabaseConfigured() === true, 'Supabase client is configured from environment variables');
  assert(supabase !== null, 'Supabase client instance successfully created');

  const subjects = await learningService.getSubjects();
  assert(subjects && subjects.length >= 8, `Read ${subjects.length} shared subjects from database`);
  
  const pyTopics = await learningService.getTopics('python');
  assert(pyTopics && pyTopics.length === 40, `Read all 40 official Python topics from database`);
  
  const sampleTopic = pyTopics.find(t => t.slug === 'py-basics' || t.id === 'py-basics');
  assert(sampleTopic && sampleTopic.question, 'Topic contains interactive evaluation question and options');

  // 2. Test Brand New User Learning State (MUST BE ZERO)
  console.log('\n--- TEST 2: Brand New User Learning Progress ---');
  const { learningStore } = await import('../src/data/learningStore.js');
  const userA_Id = 'user_test_alpha_123';
  const initialProg = learningStore.getProgress(userA_Id);
  assert(initialProg.percentage === 0, `New user starts at strictly 0% (got ${initialProg.percentage}%)`);
  assert(initialProg.completedCount === 0, `New user has 0 completed topics (got ${initialProg.completedCount})`);
  assert(initialProg.completedTopicIds.length === 0, `New user has empty completedTopicIds array`);

  // 3. Test Question Evaluation & Learning Progression Behavior
  console.log('\n--- TEST 3: Question Evaluation Engine ---');
  // Attempt with INCORRECT answer
  const wrongRes = await learningStore.submitAnswer(userA_Id, 'py-basics', 0); // Correct is index 1
  assert(wrongRes.isCorrect === false, 'Incorrect answer is correctly evaluated as false');
  const progAfterWrong = learningStore.getProgress(userA_Id);
  assert(progAfterWrong.percentage === 0, `Progress remains 0% after incorrect answer (got ${progAfterWrong.percentage}%)`);
  assert(progAfterWrong.completedCount === 0, `Topic remains uncompleted after incorrect answer`);

  // Attempt with CORRECT answer
  const correctRes = await learningStore.submitAnswer(userA_Id, 'py-basics', 1);
  assert(correctRes.isCorrect === true, 'Correct answer is evaluated as true');
  assert(correctRes.newlyCompleted === true, 'Topic marked newlyCompleted = true upon correct answer');
  const progAfterCorrect = learningStore.getProgress(userA_Id);
  assert(progAfterCorrect.completedCount === 1, `Completed topics increased to 1`);
  const expectedPct = Math.round((1 / 40) * 100);
  assert(progAfterCorrect.percentage === expectedPct, `Progress updated dynamically to ${expectedPct}% (got ${progAfterCorrect.percentage}%)`);
  assert(progAfterCorrect.completedTopicIds.includes('py-basics'), 'Completed topic ID persisted in list');

  // 4. Test User Data Isolation (Multi-User Verification)
  console.log('\n--- TEST 4: Multi-User Data Isolation (RLS Principle) ---');
  const userB_Id = 'user_test_beta_456';
  const userBProg = learningStore.getProgress(userB_Id);
  assert(userBProg.percentage === 0, `User B starts at 0% despite User A having completed topics`);
  assert(userBProg.completedCount === 0, `User B has 0 completed topics (got ${userBProg.completedCount})`);
  assert(!userBProg.completedTopicIds.includes('py-basics'), `User B does NOT have access to User A's completed topic`);

  // 5. Test Dynamic Skill Constellation Data (Zero Fake Progress)
  console.log('\n--- TEST 5: Dynamic Skill Constellation Generation ---');
  const { getDynamicSkillData } = await import('../src/modules/skillConstellation.js');
  const userASkills = getDynamicSkillData(userA_Id);
  const userBSkills = getDynamicSkillData(userB_Id);

  assert(userBSkills.python.progress === 0, `User B Python progress is 0% (NOT 94%)`);
  assert(userBSkills.python.status === 'Not Started', `User B Python status is 'Not Started' (NOT 'Mastered')`);
  assert(userBSkills.dsa.progress === 0, `User B DSA progress is 0% (NOT 88%)`);
  assert(userBSkills.ml.progress === 0, `User B ML progress is 0% (NOT 75%)`);
  assert(userBSkills.dl.progress === 0, `User B DL progress is 0% (NOT 58%)`);
  assert(userBSkills.genai.progress === 0, `User B GenAI progress is 0% (NOT 42%)`);

  assert(userASkills.python.progress === expectedPct, `User A Python reflects verified progress (${expectedPct}%)`);
  assert(userASkills.python.status === 'In Progress', `User A Python status dynamically updated to 'In Progress'`);

  // 6. Test Project Management & Task Driven Progress
  console.log('\n--- TEST 6: Project Lifecycle & Dynamic Task Progress ---');
  const { projectStore } = await import('../src/data/projectStore.js');
  const initialUserAProjects = projectStore.getProjects(userA_Id);
  assert(initialUserAProjects.length === 0, `New user starts with strictly 0 projects`);

  // Create Project
  const createdProj = projectStore.createProject(userA_Id, {
    name: 'AURA Autonomous Agent',
    description: 'Database backed personal operating system',
    source: 'manual',
    status: 'Active',
    priority: 'High'
  });
  assert(createdProj && createdProj.name === 'AURA Autonomous Agent', 'Project created successfully');

  // Verify User B cannot see User A's project
  const userBProjects = projectStore.getProjects(userB_Id);
  assert(userBProjects.length === 0, `User B has 0 projects — isolated from User A`);

  // Add Task to User A's project
  const task1 = projectStore.addTask(userA_Id, createdProj.id, { title: 'Implement RLS Policies', status: 'todo' });
  const task2 = projectStore.addTask(userA_Id, createdProj.id, { title: 'Seed Python Curriculum', status: 'todo' });
  assert(task1 && task2, 'Tasks added to project');

  // Complete one task
  projectStore.updateTaskStatus(userA_Id, createdProj.id, task1.id, 'completed');
  const updatedProj = projectStore.getProjectById(userA_Id, createdProj.id);
  assert(updatedProj.progress === 50, `Project progress dynamically computed from tasks (1 of 2 completed = 50%, got ${updatedProj.progress}%)`);

  // Complete second task
  projectStore.updateTaskStatus(userA_Id, createdProj.id, task2.id, 'completed');
  const completedProj = projectStore.getProjectById(userA_Id, createdProj.id);
  assert(completedProj.progress === 100, `Project progress dynamically reached 100% (got ${completedProj.progress}%)`);

  // Archive project
  projectStore.archiveProject(userA_Id, createdProj.id);
  const archivedProj = projectStore.getProjectById(userA_Id, createdProj.id);
  assert(archivedProj.status === 'Archived', `Project status transitioned to 'Archived'`);

  // Delete project
  projectStore.deleteProject(userA_Id, createdProj.id);
  const deletedCheck = projectStore.getProjectById(userA_Id, createdProj.id);
  assert(deletedCheck === null, `Project record deleted successfully`);

  // 7. Test Analytics Telemetry
  console.log('\n--- TEST 7: Analytics Telemetry Derived From Real Activity ---');
  const { analyticsService } = await import('../src/data/analyticsService.js');
  const userAMetrics = analyticsService.getUserMetrics(userA_Id);
  assert(userAMetrics.questionsSolvedCount === 1, `Questions solved metric matches real events (got ${userAMetrics.questionsSolvedCount})`);
  assert(userAMetrics.topicsCompletedCount === 1, `Topics completed metric matches real events (got ${userAMetrics.topicsCompletedCount})`);

  const userBMetrics = analyticsService.getUserMetrics(userB_Id);
  assert(userBMetrics.questionsSolvedCount === 0, `User B analytics metrics strictly 0`);
  assert(userBMetrics.focusMinutesTotal === 0, `User B focus minutes strictly 0`);
  assert(userBMetrics.codingSessionsCount === 0, `User B coding sessions strictly 0`);

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
