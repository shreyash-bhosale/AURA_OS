-- =============================================================================
-- AURA OS — SEED CURRICULUM
-- Migration: 002_seed_curriculum.sql
-- Seeds official learning subjects, topics, and question evaluations.
-- Does NOT seed any user progress, user attempts, or private user data.
-- =============================================================================

DO $$
DECLARE
  sub_py UUID;
  sub_dsa UUID;
  sub_ml UUID;
  sub_dl UUID;
  sub_genai UUID;
  sub_js UUID;
  sub_cpp UUID;
  sub_math UUID;
  top_id UUID;
BEGIN

  -- 1. SEED SUBJECTS
  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'Python', 'python', 'Complete Python from foundational syntax to metaprogramming and systems.', 1)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_py;

  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'Data Structures & Algorithms', 'dsa', 'Algorithmic complexity, trees, graphs, dynamic programming.', 2)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_dsa;

  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'Machine Learning', 'ml', 'Supervised, unsupervised learning, statistical modeling, optimization.', 3)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_ml;

  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'Deep Learning', 'dl', 'Neural networks, backprop, convolutional nets, and vision architectures.', 4)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_dl;

  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'Generative AI', 'genai', 'Transformers, attention mechanisms, LLMs, LoRA, and embeddings.', 5)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_genai;

  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'JavaScript', 'javascript', 'Modern ESNext, asynchronous runtime, DOM, and event loop.', 6)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_js;

  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'C++', 'cpp', 'Memory management, pointers, templates, RAII, and systems programming.', 7)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_cpp;

  INSERT INTO public.learning_subjects (id, name, slug, description, order_index)
  VALUES (gen_random_uuid(), 'Mathematics', 'mathematics', 'Linear algebra, calculus, and probability for computer science and AI.', 8)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO sub_math;

  -- 2. SEED PYTHON TOPICS & QUESTIONS
  -- Helper macro-like inserts for all 40 topics

  -- 1. Python Basics
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Python Basics', 'py-basics', 'Introduction to Python philosophy, execution model, and syntax structure.', 'Foundations', 'Beginner', 1)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'How does Python define the scope of loops, functions, and conditional blocks?', 'multiple_choice', 'Beginner',
    '["Using curly braces { } like C/Java", "Using indentation (whitespace)", "Using begin and end keywords", "Using parentheses ( )"]'::jsonb,
    '1', 'Python uses whitespace indentation (standard 4 spaces) rather than curly braces to delimit code blocks.');

  -- 2. Variables
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Variables', 'py-variables', 'Dynamic typing, variable naming conventions, and reference assignment.', 'Foundations', 'Beginner', 2)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What will be the output of this code?\n\nx = 5\ny = x\nx = 10\nprint(y)', 'code_output', 'Beginner',
    '["5", "10", "None", "Error"]'::jsonb,
    '0', 'Integers are immutable objects. When y = x executes, y points to 5. Reassigning x = 10 points x to a new integer object and leaves y unchanged.');

  -- 3. Data Types
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Data Types', 'py-datatypes', 'Core scalar types: int, float, bool, str, NoneType, and type casting.', 'Foundations', 'Beginner', 3)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the return value of type(3.14)?', 'multiple_choice', 'Beginner',
    '["<class ''int''>", "<class ''float''>", "<class ''double''>", "<class ''number''>"]'::jsonb,
    '1', 'In Python, all floating-point numbers are instances of the built-in float class.');

  -- 4. Input and Output
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Input and Output', 'py-io', 'Reading user input with input() and formatted printing using f-strings.', 'Foundations', 'Beginner', 4)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What data type does the built-in input() function always return?', 'multiple_choice', 'Beginner',
    '["int", "float", "str", "Depends on input"]'::jsonb,
    '2', 'input() reads stdin as raw text and always returns a string (str). Numerical input must be explicitly converted with int() or float().');

  -- 5. Operators
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Operators', 'py-operators', 'Arithmetic, modulo, floor division, assignment, and comparison operators.', 'Foundations', 'Beginner', 5)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the result of 7 // 2 in Python?', 'code_output', 'Beginner',
    '["3.5", "3", "4", "1"]'::jsonb,
    '1', '// is integer floor division, which rounds down towards negative infinity, resulting in 3.');

  -- 6. Conditional Statements
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Conditional Statements', 'py-conditional-statements', 'Boolean expressions, truthiness rules, and conditional branching.', 'Control Flow', 'Beginner', 6)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Which of the following values evaluates to True in a boolean conditional?', 'multiple_choice', 'Beginner',
    '["0", "None", "[] (empty list)", "\"[0]\" (non-empty list)"]'::jsonb,
    '3', 'In Python, empty collections and 0 evaluate to False. A list with elements is truthy.');

  -- 7. if Statements
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'if Statements', 'py-if', 'Primary decision-making construct in Python.', 'Control Flow', 'Beginner', 7)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What character must follow the condition in an if statement?', 'multiple_choice', 'Beginner',
    '["Semicolon ;", "Colon :", "Opening bracket {", "Arrow ->"]'::jsonb,
    '1', 'All Python compound statements (if, for, while, def, class) terminate their header line with a colon (:).');

  -- 8. elif Statements
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'elif Statements', 'py-elif', 'Chained conditional evaluation avoiding deeply nested statements.', 'Control Flow', 'Beginner', 8)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'When is an elif block evaluated?', 'multiple_choice', 'Beginner',
    '["Always, after the if block executes", "Only if preceding if and elif conditions are False", "Concurrently with the if block", "Only if the condition is True and if was True"]'::jsonb,
    '1', 'elif clauses are evaluated sequentially only when all preceding if and elif conditions evaluated to False.');

  -- 9. else Statements
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'else Statements', 'py-else', 'Default fallback block in conditional chains.', 'Control Flow', 'Beginner', 9)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Can an else statement accept a conditional expression directly (e.g. else x > 5)?', 'multiple_choice', 'Beginner',
    '["Yes, always", "No, else has no condition; use elif instead", "Yes, if wrapped in parentheses", "Only inside a loop"]'::jsonb,
    '1', 'An else statement has no condition; it is the default branch when no prior test passed. For conditional branches, use elif.');

  -- 10. for Loops
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'for Loops', 'py-for-loops', 'Definite iteration over iterables using range() and collection traversal.', 'Control Flow', 'Beginner', 10)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'How many times does this loop execute?\n\nfor i in range(1, 5):\n    pass', 'code_output', 'Beginner',
    '["5 times", "4 times", "3 times", "Infinite"]'::jsonb,
    '1', 'range(start, stop) includes start (1) and excludes stop (5), generating 1, 2, 3, 4 (4 iterations).');

  -- 11. while Loops
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'while Loops', 'py-while-loops', 'Indefinite iteration governed by boolean predicates, break, and continue.', 'Control Flow', 'Beginner', 11)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Which keyword immediately terminates a loop prematurely?', 'multiple_choice', 'Beginner',
    '["continue", "break", "pass", "exit"]'::jsonb,
    '1', 'The break keyword halts the current loop immediately and transfers control to the statement following the loop.');

  -- 12. Strings
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Strings', 'py-strings', 'Immutable UTF-8 sequences, zero-based indexing, and slice notation.', 'Data Structures', 'Beginner', 12)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the output of "Python"[-1]?', 'code_output', 'Beginner',
    '["P", "n", "o", "IndexError"]'::jsonb,
    '1', 'Negative indices index from the end backwards. -1 is the last character ("n").');

  -- 13. String Methods
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'String Methods', 'py-string-methods', 'Transformation and inspection: strip, split, join, replace, format.', 'Data Structures', 'Beginner', 13)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What does "-".join(["a", "b", "c"]) evaluate to?', 'code_output', 'Beginner',
    '["a-b-c", "[\"a-b-c\"]", "-a-b-c-", "abc-"]'::jsonb,
    '0', 'str.join(iterable) concatenates elements of the iterable separated by the string delimiter, giving "a-b-c".');

  -- 14. Lists
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Lists', 'py-lists', 'Ordered, mutable sequences capable of holding heterogeneous elements.', 'Data Structures', 'Beginner', 14)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Are Python lists mutable or immutable?', 'multiple_choice', 'Beginner',
    '["Mutable (can modify in-place)", "Immutable (cannot change after creation)", "Mutable only if containing numbers", "Depends on tuple wrapping"]'::jsonb,
    '0', 'Lists are mutable sequences in Python. You can reassign elements, append, extend, or pop elements in-place.');

  -- 15. List Methods
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'List Methods', 'py-list-methods', 'In-place mutators: append(), extend(), insert(), pop(), remove(), sort().', 'Data Structures', 'Beginner', 15)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the difference between list.append([1, 2]) and list.extend([1, 2])?', 'multiple_choice', 'Beginner',
    '["append adds [1,2] as a single element; extend iterates and adds 1 and 2 individually", "They are identical aliases", "extend works only on tuples", "append mutates; extend returns a new list"]'::jsonb,
    '0', 'append() adds its argument as a single element, while extend() unpacks the iterable and adds each item.');

  -- 16. Tuples
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Tuples', 'py-tuples', 'Ordered, immutable sequences used for heterogeneous records and dictionary keys.', 'Data Structures', 'Beginner', 16)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'How do you create a single-element tuple containing the number 42?', 'multiple_choice', 'Beginner',
    '["(42)", "(42,)", "tuple[42]", "42!"]'::jsonb,
    '1', 'Parentheses without a trailing comma are treated as grouping syntax. The comma (42,) makes it a tuple.');

  -- 17. Sets
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Sets', 'py-sets', 'Unordered collections of unique, hashable elements with O(1) membership tests.', 'Data Structures', 'Intermediate', 17)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the average time complexity of checking membership (x in s) for a Python set?', 'multiple_choice', 'Intermediate',
    '["O(n)", "O(log n)", "O(1)", "O(n^2)"]'::jsonb,
    '2', 'Sets are implemented as hash tables, providing O(1) average lookup and insertion complexity.');

  -- 18. Dictionaries
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Dictionaries', 'py-dictionaries', 'Key-value mapping data structure maintaining insertion order in Python 3.7+.', 'Data Structures', 'Intermediate', 18)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Which of the following can NOT be used as a dictionary key in Python?', 'multiple_choice', 'Intermediate',
    '["An integer (1)", "A string (\"key\")", "A tuple (1, 2)", "A list [1, 2]"]'::jsonb,
    '3', 'Dictionary keys must be hashable and immutable. Lists are mutable and do not implement __hash__, raising TypeError.');

  -- 19. Dictionary Methods
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Dictionary Methods', 'py-dict-methods', 'Inspecting and mutating maps: get(), keys(), values(), items(), setdefault().', 'Data Structures', 'Intermediate', 19)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What does d.get("missing_key", 0) return if "missing_key" is not present in dictionary d?', 'multiple_choice', 'Intermediate',
    '["KeyError exception", "None", "0", "False"]'::jsonb,
    '2', 'The get() method returns the specified default value (here 0) instead of raising KeyError when a key is absent.');

  -- 20. Functions
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Functions', 'py-functions', 'Defining callable routines with def, docstrings, and first-class functions.', 'Modular Code', 'Intermediate', 20)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Are functions in Python first-class objects?', 'multiple_choice', 'Intermediate',
    '["Yes, they can be passed as arguments, assigned to variables, and returned from other functions", "No, they are primitive static subroutines", "Only if decorated with @classmethod", "Only lambda expressions are first-class"]'::jsonb,
    '0', 'Python functions are first-class citizens: they can be stored in variables, passed to other functions, and returned dynamically.');

  -- 21. Parameters and Arguments
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Parameters and Arguments', 'py-params-args', 'Positional, keyword, default arguments, *args, and **kwargs.', 'Modular Code', 'Intermediate', 21)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'In a function definition def fn(*args, **kwargs), what types do args and kwargs have inside fn?', 'multiple_choice', 'Intermediate',
    '["args is list, kwargs is list", "args is tuple, kwargs is dict", "args is set, kwargs is dict", "args is generator, kwargs is tuple"]'::jsonb,
    '1', '*args packs positional parameters into a tuple; **kwargs packs keyword parameters into a dict.');

  -- 22. Return Values
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Return Values', 'py-return-values', 'Returning data from functions, tuple packing, and default None returns.', 'Modular Code', 'Intermediate', 22)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What does a Python function return if it reaches the end of its body without an explicit return statement?', 'multiple_choice', 'Intermediate',
    '["0", "False", "None", "Undefined"]'::jsonb,
    '2', 'Functions without an explicit return statement implicitly return None.');

  -- 23. Scope
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Scope', 'py-scope', 'The LEGB rule (Local, Enclosing, Global, Built-in) and global / nonlocal keywords.', 'Modular Code', 'Intermediate', 23)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the lookup order specified by the Python LEGB rule?', 'multiple_choice', 'Intermediate',
    '["Local -> Enclosing -> Global -> Built-in", "Global -> Local -> Enclosing -> Built-in", "Built-in -> Global -> Enclosing -> Local", "Local -> Global -> Enclosing -> Built-in"]'::jsonb,
    '0', 'Python searches variables from innermost to outermost: Local, then Enclosing (outer functions), then Global (module), then Built-in.');

  -- 24. Recursion
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Recursion', 'py-recursion', 'Recursive algorithms, call stack frames, base cases, and RecursionError.', 'Algorithms & Logic', 'Intermediate', 24)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What happens if a recursive function lacks a base case in Python?', 'multiple_choice', 'Intermediate',
    '["The program executes forever with 100% CPU", "Python raises RecursionError: maximum recursion depth exceeded", "The OS terminates the process immediately", "Python automatically switches to an iterative loop"]'::jsonb,
    '1', 'Python limits call stack depth (default ~1000 frames) to protect against memory corruption, raising RecursionError when exceeded.');

  -- 25. Exception Handling
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Exception Handling', 'py-exception-handling', 'try, except, else, finally blocks, and raising custom exceptions.', 'Robust Systems', 'Intermediate', 25)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'When does the code inside a finally block execute?', 'multiple_choice', 'Intermediate',
    '["Only if an exception was caught", "Only if NO exception occurred", "Always, whether an exception was raised, caught, or not", "Only on process exit"]'::jsonb,
    '2', 'The finally clause is executed under all circumstances, ensuring cleanup routines (like closing file descriptors) always run.');

  -- 26. File Handling
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'File Handling', 'py-file-handling', 'Context managers with open(), file modes (r, w, a, b), and streaming I/O.', 'System & I/O', 'Intermediate', 26)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Why is using "with open(...) as f:" the recommended pattern for file I/O?', 'multiple_choice', 'Intermediate',
    '["It automatically closes the file handle even if an error occurs", "It makes file reads 10x faster", "It creates a background thread for disk operations", "It prevents file writing"]'::jsonb,
    '0', 'The with statement invokes the context manager protocol (__enter__ and __exit__), guaranteeing file closure upon exiting the block.');

  -- 27. Modules
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Modules', 'py-modules', 'Organizing code into .py files, import statements, and __name__ == "__main__".', 'Architecture', 'Intermediate', 27)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What does __name__ evaluate to when a Python script is executed directly from the terminal?', 'code_output', 'Intermediate',
    '["\"__main__\"", "\"__init__\"", "\"root\"", "\"module\""]'::jsonb,
    '0', 'When a script is run directly, Python sets its internal __name__ global to "__main__".');

  -- 28. Packages
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Packages', 'py-packages', 'Directory-based modules, __init__.py role, relative imports, and namespace packages.', 'Architecture', 'Intermediate', 28)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What special file historically identifies a filesystem directory as a Python package?', 'multiple_choice', 'Intermediate',
    '["package.json", "__init__.py", "__main__.py", "setup.py"]'::jsonb,
    '1', '__init__.py denotes a regular package and executes initialization code when the package is imported.');

  -- 29. Virtual Environments
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Virtual Environments', 'py-virtual-environments', 'Isolating dependencies using venv, pip, pyproject.toml, and lockfiles.', 'Tooling', 'Intermediate', 29)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What standard library command creates an isolated Python virtual environment named .venv?', 'multiple_choice', 'Intermediate',
    '["python -m venv .venv", "pip install virtualenv", "npm init .venv", "python make-env .venv"]'::jsonb,
    '0', 'python -m venv <path> uses the built-in venv module to create an isolated environment with its own binaries and site-packages.');

  -- 30. Object-Oriented Programming
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Object-Oriented Programming', 'py-oop', 'Core paradigms: classes, instances, encapsulation, and abstractions.', 'OOP', 'Intermediate', 30)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the role of self as the first parameter of an instance method in Python?', 'multiple_choice', 'Intermediate',
    '["It is a keyword that imports standard classes", "It references the specific instance of the class invoking the method", "It refers to the parent class", "It is optional and can be omitted"]'::jsonb,
    '1', 'Python passes the calling instance explicitly as the first argument to instance methods, conventionally named self.');

  -- 31. Classes
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Classes', 'py-classes', 'Class definitions, __init__ constructor, class attributes vs instance attributes.', 'OOP', 'Intermediate', 31)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'Where should instance variables typically be initialized in a Python class?', 'multiple_choice', 'Intermediate',
    '["Directly in the class body outside any method", "Inside the __init__ initializer method", "Inside __del__", "In the global scope"]'::jsonb,
    '1', 'Instance-specific attributes should be attached to self inside the __init__ constructor to ensure clean encapsulation.');

  -- 32. Objects
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Objects', 'py-objects', 'Instance instantiation, identity (id), equality (__eq__), and string representations (__str__, __repr__).', 'OOP', 'Intermediate', 32)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What dunder method is called by the built-in str() and print() functions for informal representation?', 'multiple_choice', 'Intermediate',
    '["__repr__", "__str__", "__format__", "__print__"]'::jsonb,
    '1', '__str__ produces a user-readable string representation, whereas __repr__ aims for an unambiguous technical representation.');

  -- 33. Inheritance
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Inheritance', 'py-inheritance', 'Single and multiple inheritance, method overriding, super(), and MRO.', 'OOP', 'Advanced', 33)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What built-in function delegates method calls to a parent class along the Method Resolution Order (MRO)?', 'multiple_choice', 'Advanced',
    '["parent()", "super()", "base()", "inherit()"]'::jsonb,
    '1', 'super() returns a proxy object delegating method calls to parent or sibling classes according to C3 linearization MRO.');

  -- 34. Polymorphism
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Polymorphism', 'py-polymorphism', 'Duck typing: "If it walks like a duck and quacks like a duck, it is a duck".', 'OOP', 'Advanced', 34)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'How is polymorphism primarily achieved in idiomatic Python?', 'multiple_choice', 'Advanced',
    '["Strict static interface implementation", "Duck typing (behavior-based rather than explicit type checking)", "Operator overloading exclusively", "Memory casting"]'::jsonb,
    '1', 'Python favors duck typing: code checks whether an object provides the required methods/attributes at runtime rather than requiring a nominal interface.');

  -- 35. Encapsulation
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Encapsulation', 'py-encapsulation', 'Data hiding conventions (_protected, __private name mangling) and @property decorators.', 'OOP', 'Advanced', 35)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What happens to a class attribute named __secret (two leading underscores) in Python?', 'multiple_choice', 'Advanced',
    '["It is permanently encrypted in bytecode", "It is name-mangled to _ClassName__secret to prevent accidental subclass overrides", "It raises a syntax error", "It is made completely inaccessible from outside"]'::jsonb,
    '1', 'Attributes with two leading underscores undergo name mangling, being rewritten as _ClassName__secret to protect against collision in subclasses.');

  -- 36. List Comprehensions
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'List Comprehensions', 'py-list-comprehensions', 'Compact declarative syntax for transforming iterables with optional filtering.', 'Pythonic Idioms', 'Intermediate', 36)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the output of [x**2 for x in range(4) if x % 2 == 0]?', 'code_output', 'Intermediate',
    '["[0, 4]", "[0, 1, 4, 9]", "[1, 9]", "[4]"]'::jsonb,
    '0', 'range(4) produces 0, 1, 2, 3. The even numbers are 0 and 2. Their squares are 0 and 4.');

  -- 37. Iterators
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Iterators', 'py-iterators', 'The iterator protocol: __iter__() returning self and __next__() raising StopIteration.', 'Advanced Python', 'Advanced', 37)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What exception signals the termination of an iterator in Python?', 'multiple_choice', 'Advanced',
    '["EOFError", "StopIteration", "IndexError", "GeneratorExit"]'::jsonb,
    '1', 'The __next__() method of an iterator raises StopIteration when there are no further items to yield.');

  -- 38. Generators
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Generators', 'py-generators', 'Memory-efficient lazy streaming using the yield statement and generator expressions.', 'Advanced Python', 'Advanced', 38)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What is the primary memory advantage of a generator compared to a list comprehension?', 'multiple_choice', 'Advanced',
    '["Generators compress data using gzip", "Generators produce values on demand (lazy evaluation) without storing all items in RAM", "Generators run on the GPU", "Generators execute synchronously in C"]'::jsonb,
    '1', 'Generators evaluate lazily, yielding one value at a time and maintaining minimal O(1) memory footprint regardless of stream size.');

  -- 39. Decorators
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Decorators', 'py-decorators', 'Higher-order wrapper functions using @decorator syntax and functools.wraps.', 'Advanced Python', 'Advanced', 39)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'What does the @functools.wraps decorator do when writing custom decorators?', 'multiple_choice', 'Advanced',
    '["Compiles the function to C code", "Preserves the original function name, docstring, and annotations on the wrapper", "Enforces strict type checks", "Automatically caches function return values"]'::jsonb,
    '1', '@functools.wraps copies the __name__, __doc__, and other introspection metadata from the decorated target to the wrapper.');

  -- 40. Testing
  INSERT INTO public.learning_topics (subject_id, name, slug, description, category, difficulty, order_index)
  VALUES (sub_py, 'Testing', 'py-testing', 'Unit testing principles, unittest framework, pytest assertions, fixtures, and mocks.', 'Quality & Verification', 'Advanced', 40)
  ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO top_id;
  INSERT INTO public.learning_questions (topic_id, question, question_type, difficulty, options, expected_answer, explanation)
  VALUES (top_id, 'In pytest, what keyword is used for test assertions without needing special TestCase methods?', 'multiple_choice', 'Advanced',
    '["assert", "expect", "verify", "should"]'::jsonb,
    '0', 'pytest intercepts the native Python assert statement with rich introspection to display detailed evaluation comparisons.');

END $$;
