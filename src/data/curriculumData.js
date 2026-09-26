/**
 * AURA Official Curriculum Data
 * Full beginner-to-advanced Python syllabus matching migration seed.
 * All questions contain verifiable options and explanations.
 */

export const SUBJECTS_FALLBACK = [
  { id: 'sub-py', name: 'Python', slug: 'python', description: 'Complete Python from foundational syntax to systems programming.' },
  { id: 'sub-dsa', name: 'Data Structures & Algorithms', slug: 'dsa', description: 'Algorithmic complexity, trees, graphs, dynamic programming.' },
  { id: 'sub-ml', name: 'Machine Learning', slug: 'ml', description: 'Supervised, unsupervised learning, statistical modeling.' },
  { id: 'sub-dl', name: 'Deep Learning', slug: 'dl', description: 'Neural networks, backprop, convolutional nets, and vision architectures.' },
  { id: 'sub-genai', name: 'Generative AI', slug: 'genai', description: 'Transformers, attention mechanisms, LLMs, LoRA, and embeddings.' },
  { id: 'sub-js', name: 'JavaScript', slug: 'javascript', description: 'Modern ESNext, asynchronous runtime, DOM, and event loop.' },
  { id: 'sub-cpp', name: 'C++', slug: 'cpp', description: 'Memory management, pointers, templates, RAII, and systems programming.' },
  { id: 'sub-math', name: 'Mathematics', slug: 'mathematics', description: 'Linear algebra, calculus, and probability for computer science and AI.' }
];

export const PYTHON_FALLBACK_CURRICULUM = [
  {
    id: 'py-basics',
    slug: 'py-basics',
    title: 'Python Basics',
    category: 'Foundations',
    difficulty: 'Beginner',
    summary: 'Introduction to Python philosophy, execution model, and syntax structure.',
    lesson: 'Python is an interpreted, high-level language with clean indentation-based syntax. Statements are evaluated sequentially, and comments start with #.',
    question: {
      type: 'multiple-choice',
      prompt: 'How does Python define the scope of loops, functions, and conditional blocks?',
      options: [
        'Using curly braces { } like C/Java',
        'Using indentation (whitespace)',
        'Using begin and end keywords',
        'Using parentheses ( )'
      ],
      correctIndex: 1,
      explanation: 'Python uses whitespace indentation (standard 4 spaces) rather than curly braces to delimit code blocks.'
    }
  },
  {
    id: 'py-variables',
    slug: 'py-variables',
    title: 'Variables',
    category: 'Foundations',
    difficulty: 'Beginner',
    summary: 'Dynamic typing, variable naming rules, and reference assignment.',
    lesson: 'In Python, variables are dynamically typed references to objects. Assignment is performed using = without type declarations.',
    question: {
      type: 'code-output',
      prompt: 'What will be the output of this code?\n\nx = 5\ny = x\nx = 10\nprint(y)',
      options: ['5', '10', 'None', 'Error'],
      correctIndex: 0,
      explanation: 'Integers are immutable. When y = x executes, y references 5. Reassigning x = 10 does not alter y.'
    }
  },
  {
    id: 'py-datatypes',
    slug: 'py-datatypes',
    title: 'Data Types',
    category: 'Foundations',
    difficulty: 'Beginner',
    summary: 'Core scalar types: int, float, bool, str, NoneType, and type conversion.',
    lesson: 'Python features built-in types: int (arbitrary precision), float (IEEE 754), bool (True/False), and str (Unicode). You can check types with type().',
    question: {
      type: 'multiple-choice',
      prompt: 'What is the type of the expression: type(3.14)?',
      options: ['<class \'int\'>', '<class \'float\'>', '<class \'double\'>', '<class \'number\'>'],
      correctIndex: 1,
      explanation: 'In Python, all floating-point numbers are instances of the built-in float class.'
    }
  },
  {
    id: 'py-io',
    slug: 'py-io',
    title: 'Input and Output',
    category: 'Foundations',
    difficulty: 'Beginner',
    summary: 'Reading user input with input() and formatting output with f-strings.',
    lesson: 'Use print() to write to stdout and input() to read strings from stdin. F-strings (e.g. f"Hello, {name}") provide fast, readable formatting.',
    question: {
      type: 'multiple-choice',
      prompt: 'What data type does the built-in input() function always return?',
      options: ['int', 'float', 'str', 'Depends on what the user types'],
      correctIndex: 2,
      explanation: 'input() always reads input as a string (str). You must explicitly cast it with int() or float().'
    }
  },
  {
    id: 'py-operators',
    slug: 'py-operators',
    title: 'Operators',
    category: 'Foundations',
    difficulty: 'Beginner',
    summary: 'Arithmetic, logical (and/or/not), comparison, and identity (is/is not) operators.',
    lesson: 'Python provides +, -, *, /, // (floor division), % (modulo), and ** (power). Use == for equality and is for object identity.',
    question: {
      type: 'code-output',
      prompt: 'What is the result of 7 // 2 in Python?',
      options: ['3.5', '3', '4', '1'],
      correctIndex: 1,
      explanation: '// is floor division, which truncates the fractional part and returns 3.'
    }
  },
  {
    id: 'py-conditional-statements',
    slug: 'py-conditional-statements',
    title: 'Conditional Statements',
    category: 'Control Flow',
    difficulty: 'Beginner',
    summary: 'Truthiness, comparison expressions, and short-circuit evaluation.',
    lesson: 'Empty containers ([], {}, ""), 0, and None evaluate to False in boolean contexts. Everything else is truthy.',
    question: {
      type: 'multiple-choice',
      prompt: 'Which of the following evaluates to True in a Python conditional?',
      options: ['0', '""', 'None', '[0]'],
      correctIndex: 3,
      explanation: 'A non-empty list [0] evaluates to True, even though its solitary element is 0.'
    }
  },
  {
    id: 'py-if',
    slug: 'py-if',
    title: 'if Statements',
    category: 'Control Flow',
    difficulty: 'Beginner',
    summary: 'Primary decision-making construct in Python.',
    lesson: 'An if statement evaluates a test expression. If truthy, the indented code block executes.',
    question: {
      type: 'multiple-choice',
      prompt: 'What character must follow the condition in an if statement?',
      options: ['Semicolon ;', 'Colon :', 'Opening brace {', 'Arrow ->'],
      correctIndex: 1,
      explanation: 'All compound statements in Python require a colon (:) terminating the header.'
    }
  },
  {
    id: 'py-elif',
    slug: 'py-elif',
    title: 'elif Statements',
    category: 'Control Flow',
    difficulty: 'Beginner',
    summary: 'Chained conditional evaluation avoiding deeply nested statements.',
    lesson: 'elif allows testing multiple expressions sequentially, executing only the first matching branch.',
    question: {
      type: 'multiple-choice',
      prompt: 'When is an elif block evaluated?',
      options: [
        'Always, after the if block executes',
        'Only if preceding if and elif conditions are False',
        'Concurrently with the if block',
        'Only if the condition is True and if was True'
      ],
      correctIndex: 1,
      explanation: 'elif clauses are evaluated sequentially only when preceding conditions were False.'
    }
  },
  {
    id: 'py-else',
    slug: 'py-else',
    title: 'else Statements',
    category: 'Control Flow',
    difficulty: 'Beginner',
    summary: 'Default fallback branch in conditional chains.',
    lesson: 'The else clause executes when none of the preceding if or elif conditions evaluate to True.',
    question: {
      type: 'multiple-choice',
      prompt: 'Can an else statement accept a conditional expression directly (e.g. else x > 5)?',
      options: [
        'Yes, always',
        'No, else has no condition; use elif instead',
        'Yes, if wrapped in parentheses',
        'Only inside a loop'
      ],
      correctIndex: 1,
      explanation: 'An else statement has no condition; it is the default branch when no prior test passed.'
    }
  },
  {
    id: 'py-for-loops',
    slug: 'py-for-loops',
    title: 'for Loops',
    category: 'Control Flow',
    difficulty: 'Beginner',
    summary: 'Definite iteration over iterables using range() and collection traversal.',
    lesson: 'for item in iterable traverses sequences directly. Use range(start, stop, step) for indexed repetition.',
    question: {
      type: 'code-output',
      prompt: 'How many iterations does this loop execute?\n\nfor i in range(1, 5):\n    pass',
      options: ['5 times', '4 times', '3 times', 'Infinite'],
      correctIndex: 1,
      explanation: 'range(1, 5) yields 1, 2, 3, 4 (4 values, stop value is exclusive).'
    }
  },
  {
    id: 'py-while-loops',
    slug: 'py-while-loops',
    title: 'while Loops',
    category: 'Control Flow',
    difficulty: 'Beginner',
    summary: 'Indefinite iteration governed by boolean predicates, break, and continue.',
    lesson: 'while loops continue execution as long as their condition remains True. Use break to exit early.',
    question: {
      type: 'multiple-choice',
      prompt: 'Which keyword immediately terminates a loop prematurely?',
      options: ['continue', 'break', 'pass', 'exit'],
      correctIndex: 1,
      explanation: 'The break keyword halts the current loop immediately and transfers execution outside.'
    }
  },
  {
    id: 'py-strings',
    slug: 'py-strings',
    title: 'Strings',
    category: 'Data Structures',
    difficulty: 'Beginner',
    summary: 'Immutable UTF-8 sequences, zero-based indexing, and slice notation.',
    lesson: 'Strings are immutable sequences in Python. Slicing with [start:stop:step] produces substrings.',
    question: {
      type: 'code-output',
      prompt: 'What is the output of "Python"[-1]?',
      options: ['P', 'n', 'o', 'IndexError'],
      correctIndex: 1,
      explanation: 'Negative indexing counts from the end. -1 refers to the last character ("n").'
    }
  },
  {
    id: 'py-string-methods',
    slug: 'py-string-methods',
    title: 'String Methods',
    category: 'Data Structures',
    difficulty: 'Beginner',
    summary: 'Transformation and inspection: strip, split, join, replace, format.',
    lesson: 'Methods like str.split() break strings into lists, and delimiter.join(list) joins them back.',
    question: {
      type: 'code-output',
      prompt: 'What does "-".join(["a", "b", "c"]) evaluate to?',
      options: ['a-b-c', '["a-b-c"]', '-a-b-c-', 'abc-'],
      correctIndex: 0,
      explanation: 'str.join(iterable) concatenates elements of the iterable separated by the delimiter.'
    }
  },
  {
    id: 'py-lists',
    slug: 'py-lists',
    title: 'Lists',
    category: 'Data Structures',
    difficulty: 'Beginner',
    summary: 'Ordered, mutable sequences capable of holding heterogeneous elements.',
    lesson: 'Lists are mutable sequences created with brackets []. Elements can be modified, appended, or removed.',
    question: {
      type: 'multiple-choice',
      prompt: 'Are Python lists mutable or immutable?',
      options: [
        'Mutable (can modify in-place)',
        'Immutable (cannot change after creation)',
        'Mutable only if containing numbers',
        'Depends on tuple wrapping'
      ],
      correctIndex: 0,
      explanation: 'Lists are mutable sequences in Python. You can reassign elements, append, or pop in-place.'
    }
  },
  {
    id: 'py-list-methods',
    slug: 'py-list-methods',
    title: 'List Methods',
    category: 'Data Structures',
    difficulty: 'Beginner',
    summary: 'In-place mutators: append(), extend(), insert(), pop(), remove(), sort().',
    lesson: 'append() adds an item to the end, while extend() unrolls an iterable and adds each item.',
    question: {
      type: 'multiple-choice',
      prompt: 'What is the difference between list.append([1, 2]) and list.extend([1, 2])?',
      options: [
        'append adds [1,2] as a single element; extend adds 1 and 2 individually',
        'They are identical aliases',
        'extend works only on tuples',
        'append mutates; extend returns a new list'
      ],
      correctIndex: 0,
      explanation: 'append() appends the argument object directly, while extend() unpacks and appends each element.'
    }
  },
  {
    id: 'py-tuples',
    slug: 'py-tuples',
    title: 'Tuples',
    category: 'Data Structures',
    difficulty: 'Beginner',
    summary: 'Ordered, immutable sequences used for heterogeneous records and dictionary keys.',
    lesson: 'Tuples are created with parentheses (1, 2). Because they are immutable, they can be hashed as dict keys.',
    question: {
      type: 'multiple-choice',
      prompt: 'How do you create a single-element tuple containing the number 42?',
      options: ['(42)', '(42,)', 'tuple[42]', '42!'],
      correctIndex: 1,
      explanation: 'Parentheses without a trailing comma are treated as grouping syntax. The comma (42,) makes it a tuple.'
    }
  },
  {
    id: 'py-sets',
    slug: 'py-sets',
    title: 'Sets',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    summary: 'Unordered collections of unique, hashable elements with O(1) membership tests.',
    lesson: 'Sets eliminate duplicates automatically and support set algebra: union (|), intersection (&), difference (-).',
    question: {
      type: 'multiple-choice',
      prompt: 'What is the average time complexity of checking membership (x in s) for a Python set?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
      correctIndex: 2,
      explanation: 'Sets are implemented as hash tables, providing O(1) average lookup and insertion complexity.'
    }
  },
  {
    id: 'py-dictionaries',
    slug: 'py-dictionaries',
    title: 'Dictionaries',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    summary: 'Key-value mapping data structure maintaining insertion order in Python 3.7+.',
    lesson: 'Dictionaries map hashable keys to arbitrary value objects using {key: value} syntax.',
    question: {
      type: 'multiple-choice',
      prompt: 'Which of the following can NOT be used as a dictionary key in Python?',
      options: ['An integer (1)', 'A string ("key")', 'A tuple (1, 2)', 'A list [1, 2]'],
      correctIndex: 3,
      explanation: 'Dictionary keys must be hashable and immutable. Lists are mutable, so they raise TypeError.'
    }
  },
  {
    id: 'py-dict-methods',
    slug: 'py-dict-methods',
    title: 'Dictionary Methods',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    summary: 'Inspecting and mutating maps: get(), keys(), values(), items(), setdefault().',
    lesson: 'get(key, default) safely queries keys without throwing KeyError if the key is missing.',
    question: {
      type: 'multiple-choice',
      prompt: 'What does d.get("missing_key", 0) return if "missing_key" is not present in dictionary d?',
      options: ['KeyError exception', 'None', '0', 'False'],
      correctIndex: 2,
      explanation: 'The get() method returns the specified default value (here 0) instead of raising KeyError.'
    }
  },
  {
    id: 'py-functions',
    slug: 'py-functions',
    title: 'Functions',
    category: 'Modular Code',
    difficulty: 'Intermediate',
    summary: 'Defining callable routines with def, docstrings, and first-class functions.',
    lesson: 'Functions organize reusable logic. They are first-class objects in Python and can be passed as arguments.',
    question: {
      type: 'multiple-choice',
      prompt: 'Are functions in Python first-class objects?',
      options: [
        'Yes, they can be passed as arguments, assigned to variables, and returned',
        'No, they are primitive static subroutines',
        'Only if decorated with @classmethod',
        'Only lambda expressions are first-class'
      ],
      correctIndex: 0,
      explanation: 'Python functions are first-class citizens: they can be stored in variables and passed to other functions.'
    }
  },
  {
    id: 'py-params-args',
    slug: 'py-params-args',
    title: 'Parameters and Arguments',
    category: 'Modular Code',
    difficulty: 'Intermediate',
    summary: 'Positional, keyword, default arguments, *args, and **kwargs.',
    lesson: '*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dict.',
    question: {
      type: 'multiple-choice',
      prompt: 'In def fn(*args, **kwargs), what types do args and kwargs have inside fn?',
      options: [
        'args is list, kwargs is list',
        'args is tuple, kwargs is dict',
        'args is set, kwargs is dict',
        'args is generator, kwargs is tuple'
      ],
      correctIndex: 1,
      explanation: '*args packs positional parameters into a tuple; **kwargs packs keyword parameters into a dict.'
    }
  },
  {
    id: 'py-return-values',
    slug: 'py-return-values',
    title: 'Return Values',
    category: 'Modular Code',
    difficulty: 'Intermediate',
    summary: 'Returning data from functions, tuple packing, and default None returns.',
    lesson: 'Functions can return single values, multiple values packed as tuples (return x, y), or None if omitted.',
    question: {
      type: 'multiple-choice',
      prompt: 'What does a Python function return if it reaches the end of its body without an explicit return statement?',
      options: ['0', 'False', 'None', 'Undefined'],
      correctIndex: 2,
      explanation: 'Functions without an explicit return statement implicitly return None.'
    }
  },
  {
    id: 'py-scope',
    slug: 'py-scope',
    title: 'Scope',
    category: 'Modular Code',
    difficulty: 'Intermediate',
    summary: 'The LEGB rule (Local, Enclosing, Global, Built-in) and global / nonlocal keywords.',
    lesson: 'Name resolution follows the LEGB hierarchy. Use nonlocal to rebind variables in outer enclosing functions.',
    question: {
      type: 'multiple-choice',
      prompt: 'What is the lookup order specified by the Python LEGB rule?',
      options: [
        'Local -> Enclosing -> Global -> Built-in',
        'Global -> Local -> Enclosing -> Built-in',
        'Built-in -> Global -> Enclosing -> Local',
        'Local -> Global -> Enclosing -> Built-in'
      ],
      correctIndex: 0,
      explanation: 'Python resolves names from innermost to outermost: Local, Enclosing, Global, Built-in.'
    }
  },
  {
    id: 'py-recursion',
    slug: 'py-recursion',
    title: 'Recursion',
    category: 'Algorithms & Logic',
    difficulty: 'Intermediate',
    summary: 'Recursive algorithms, call stack frames, base cases, and RecursionError.',
    lesson: 'Recursive functions call themselves to solve smaller subproblems. Every recursive function requires a base case.',
    question: {
      type: 'multiple-choice',
      prompt: 'What happens if a recursive function lacks a base case in Python?',
      options: [
        'The program executes forever with 100% CPU',
        'Python raises RecursionError: maximum recursion depth exceeded',
        'The OS terminates the process immediately',
        'Python automatically switches to an iterative loop'
      ],
      correctIndex: 1,
      explanation: 'Python limits call stack depth (default ~1000 frames) and raises RecursionError when exceeded.'
    }
  },
  {
    id: 'py-exception-handling',
    slug: 'py-exception-handling',
    title: 'Exception Handling',
    category: 'Robust Systems',
    difficulty: 'Intermediate',
    summary: 'try, except, else, finally blocks, and raising custom exceptions.',
    lesson: 'try/except captures runtime errors gracefully. The finally block always executes regardless of exceptions.',
    question: {
      type: 'multiple-choice',
      prompt: 'When does the code inside a finally block execute?',
      options: [
        'Only if an exception was caught',
        'Only if NO exception occurred',
        'Always, whether an exception was raised, caught, or not',
        'Only on process exit'
      ],
      correctIndex: 2,
      explanation: 'The finally clause is executed under all circumstances, guaranteeing cleanup operations.'
    }
  },
  {
    id: 'py-file-handling',
    slug: 'py-file-handling',
    title: 'File Handling',
    category: 'System & I/O',
    difficulty: 'Intermediate',
    summary: 'Context managers with open(), file modes (r, w, a, b), and streaming I/O.',
    lesson: 'Always use with open("file.txt") as f: to ensure file descriptors are automatically closed upon exit.',
    question: {
      type: 'multiple-choice',
      prompt: 'Why is using "with open(...) as f:" the recommended pattern for file I/O?',
      options: [
        'It automatically closes the file handle even if an error occurs',
        'It makes file reads 10x faster',
        'It creates a background thread for disk operations',
        'It prevents file writing'
      ],
      correctIndex: 0,
      explanation: 'The with statement invokes the context manager protocol, guaranteeing file closure upon exit.'
    }
  },
  {
    id: 'py-modules',
    slug: 'py-modules',
    title: 'Modules',
    category: 'Architecture',
    difficulty: 'Intermediate',
    summary: 'Organizing code into .py files, import statements, and __name__ == "__main__".',
    lesson: 'Any Python file is a module. Use if __name__ == "__main__": to allow both execution and importing.',
    question: {
      type: 'code-output',
      prompt: 'What does __name__ evaluate to when a script is run directly from terminal?',
      options: ['"__main__"', '"__init__"', '"root"', '"module"'],
      correctIndex: 0,
      explanation: 'When a script is run directly, Python sets its internal __name__ global to "__main__".'
    }
  },
  {
    id: 'py-packages',
    slug: 'py-packages',
    title: 'Packages',
    category: 'Architecture',
    difficulty: 'Intermediate',
    summary: 'Directory-based modules, __init__.py role, relative imports, and namespace packages.',
    lesson: 'Packages are directories containing modules and optionally an __init__.py file for package-level imports.',
    question: {
      type: 'multiple-choice',
      prompt: 'What special file historically identifies a directory as a Python package?',
      options: ['package.json', '__init__.py', '__main__.py', 'setup.py'],
      correctIndex: 1,
      explanation: '__init__.py denotes a regular package and executes initialization code upon import.'
    }
  },
  {
    id: 'py-virtual-environments',
    slug: 'py-virtual-environments',
    title: 'Virtual Environments',
    category: 'Tooling',
    difficulty: 'Intermediate',
    summary: 'Isolating dependencies using venv, pip, pyproject.toml, and lockfiles.',
    lesson: 'Virtual environments prevent dependency conflicts between different projects on the same machine.',
    question: {
      type: 'multiple-choice',
      prompt: 'What standard library command creates an isolated Python virtual environment named .venv?',
      options: ['python -m venv .venv', 'pip install virtualenv', 'npm init .venv', 'python make-env .venv'],
      correctIndex: 0,
      explanation: 'python -m venv <path> uses the built-in venv module to create an isolated environment.'
    }
  },
  {
    id: 'py-oop',
    slug: 'py-oop',
    title: 'Object-Oriented Programming',
    category: 'OOP',
    difficulty: 'Intermediate',
    summary: 'Core paradigms: classes, instances, encapsulation, and abstractions.',
    lesson: 'OOP bundles state (data attributes) and behavior (methods) together into cohesive object instances.',
    question: {
      type: 'multiple-choice',
      prompt: 'What is the role of self as the first parameter of an instance method in Python?',
      options: [
        'It is a keyword that imports standard classes',
        'It references the specific instance of the class invoking the method',
        'It refers to the parent class',
        'It is optional and can be omitted'
      ],
      correctIndex: 1,
      explanation: 'Python passes the calling instance explicitly as the first argument to instance methods, named self.'
    }
  },
  {
    id: 'py-classes',
    slug: 'py-classes',
    title: 'Classes',
    category: 'OOP',
    difficulty: 'Intermediate',
    summary: 'Class definitions, __init__ constructor, class attributes vs instance attributes.',
    lesson: 'Classes define blueprints for objects. The __init__ method initializes per-instance attributes.',
    question: {
      type: 'multiple-choice',
      prompt: 'Where should instance variables typically be initialized in a Python class?',
      options: [
        'Directly in the class body outside any method',
        'Inside the __init__ initializer method',
        'Inside __del__',
        'In the global scope'
      ],
      correctIndex: 1,
      explanation: 'Instance-specific attributes should be attached to self inside the __init__ constructor.'
    }
  },
  {
    id: 'py-objects',
    slug: 'py-objects',
    title: 'Objects',
    category: 'OOP',
    difficulty: 'Intermediate',
    summary: 'Instance instantiation, identity (id), equality (__eq__), and string representations (__str__, __repr__).',
    lesson: 'Everything in Python is an object. __str__ provides human-friendly output, while __repr__ is for debugging.',
    question: {
      type: 'multiple-choice',
      prompt: 'What dunder method is called by the built-in str() and print() functions for informal representation?',
      options: ['__repr__', '__str__', '__format__', '__print__'],
      correctIndex: 1,
      explanation: '__str__ produces a user-readable string representation, while __repr__ is for technical representation.'
    }
  },
  {
    id: 'py-inheritance',
    slug: 'py-inheritance',
    title: 'Inheritance',
    category: 'OOP',
    difficulty: 'Advanced',
    summary: 'Single and multiple inheritance, method overriding, super(), and MRO.',
    lesson: 'Inheritance lets classes derive attributes and methods from base classes. Use super() to invoke parent logic.',
    question: {
      type: 'multiple-choice',
      prompt: 'What built-in function delegates method calls to a parent class along the Method Resolution Order (MRO)?',
      options: ['parent()', 'super()', 'base()', 'inherit()'],
      correctIndex: 1,
      explanation: 'super() returns a proxy object delegating method calls to parent classes according to MRO.'
    }
  },
  {
    id: 'py-polymorphism',
    slug: 'py-polymorphism',
    title: 'Polymorphism',
    category: 'OOP',
    difficulty: 'Advanced',
    summary: 'Duck typing: "If it walks like a duck and quacks like a duck, it is a duck".',
    lesson: 'Polymorphism allows different classes to implement the same interface and be used interchangeably.',
    question: {
      type: 'multiple-choice',
      prompt: 'How is polymorphism primarily achieved in idiomatic Python?',
      options: [
        'Strict static interface implementation',
        'Duck typing (behavior-based rather than explicit type checking)',
        'Operator overloading exclusively',
        'Memory casting'
      ],
      correctIndex: 1,
      explanation: 'Python favors duck typing: code checks whether an object provides required methods at runtime.'
    }
  },
  {
    id: 'py-encapsulation',
    slug: 'py-encapsulation',
    title: 'Encapsulation',
    category: 'OOP',
    difficulty: 'Advanced',
    summary: 'Data hiding conventions (_protected, __private name mangling) and @property decorators.',
    lesson: '_single_underscore indicates internal use by convention. __double_underscore triggers name mangling.',
    question: {
      type: 'multiple-choice',
      prompt: 'What happens to a class attribute named __secret (two leading underscores) in Python?',
      options: [
        'It is permanently encrypted in bytecode',
        'It is name-mangled to _ClassName__secret to prevent accidental collision',
        'It raises a syntax error',
        'It is made completely inaccessible from outside'
      ],
      correctIndex: 1,
      explanation: 'Attributes with two leading underscores undergo name mangling to protect against collision in subclasses.'
    }
  },
  {
    id: 'py-list-comprehensions',
    slug: 'py-list-comprehensions',
    title: 'List Comprehensions',
    category: 'Pythonic Idioms',
    difficulty: 'Intermediate',
    summary: 'Compact declarative syntax for transforming iterables with optional filtering.',
    lesson: '[expression for item in iterable if condition] provides concise, optimized list creation.',
    question: {
      type: 'code-output',
      prompt: 'What is the output of [x**2 for x in range(4) if x % 2 == 0]?',
      options: ['[0, 4]', '[0, 1, 4, 9]', '[1, 9]', '[4]'],
      correctIndex: 0,
      explanation: 'range(4) produces 0, 1, 2, 3. The even numbers are 0 and 2. Their squares are 0 and 4.'
    }
  },
  {
    id: 'py-iterators',
    slug: 'py-iterators',
    title: 'Iterators',
    category: 'Advanced Python',
    difficulty: 'Advanced',
    summary: 'The iterator protocol: __iter__() returning self and __next__() raising StopIteration.',
    lesson: 'Any object that implements __iter__() and __next__() can be looped over sequentially.',
    question: {
      type: 'multiple-choice',
      prompt: 'What exception signals the termination of an iterator in Python?',
      options: ['EOFError', 'StopIteration', 'IndexError', 'GeneratorExit'],
      correctIndex: 1,
      explanation: 'The __next__() method of an iterator raises StopIteration when there are no further items.'
    }
  },
  {
    id: 'py-generators',
    slug: 'py-generators',
    title: 'Generators',
    category: 'Advanced Python',
    difficulty: 'Advanced',
    summary: 'Memory-efficient lazy streaming using the yield statement and generator expressions.',
    lesson: 'Functions with yield produce values one at a time, resuming execution state between calls.',
    question: {
      type: 'multiple-choice',
      prompt: 'What is the primary memory advantage of a generator compared to a list comprehension?',
      options: [
        'Generators compress data using gzip',
        'Generators produce values on demand (lazy evaluation) without storing all in RAM',
        'Generators run on the GPU',
        'Generators execute synchronously in C'
      ],
      correctIndex: 1,
      explanation: 'Generators evaluate lazily, maintaining minimal O(1) memory footprint regardless of stream size.'
    }
  },
  {
    id: 'py-decorators',
    slug: 'py-decorators',
    title: 'Decorators',
    category: 'Advanced Python',
    difficulty: 'Advanced',
    summary: 'Higher-order wrapper functions using @decorator syntax and functools.wraps.',
    lesson: 'Decorators wrap a function to extend or modify its behavior without modifying the function itself.',
    question: {
      type: 'multiple-choice',
      prompt: 'What does the @functools.wraps decorator do when writing custom decorators?',
      options: [
        'Compiles the function to C code',
        'Preserves the original function name, docstring, and annotations on the wrapper',
        'Enforces strict type checks',
        'Automatically caches function return values'
      ],
      correctIndex: 1,
      explanation: '@functools.wraps copies the original function name and docstring to the wrapper function.'
    }
  },
  {
    id: 'py-testing',
    slug: 'py-testing',
    title: 'Testing',
    category: 'Quality & Verification',
    difficulty: 'Advanced',
    summary: 'Unit testing principles, unittest framework, pytest assertions, fixtures, and mocks.',
    lesson: 'Automated testing verifies expected behavior under edge cases and guards against regressions.',
    question: {
      type: 'multiple-choice',
      prompt: 'In pytest, what keyword is used for test assertions without needing special TestCase methods?',
      options: ['assert', 'expect', 'verify', 'should'],
      correctIndex: 0,
      explanation: 'pytest intercepts the native Python assert statement with rich introspection to display detailed comparisons.'
    }
  }
];
