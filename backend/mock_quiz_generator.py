"""
Mock Quiz Generator - No API Key Required
Generates quiz questions locally for testing and fallback
"""

import json
from typing import List, Dict

class MockQuizGenerator:
    """Generates quiz questions without external API calls"""

    def __init__(self):
        # Pre-defined question templates by topic
        self.question_templates = {
            'python': [
                {
                    'question': 'What is the correct way to declare a variable in Python?',
                    'options': [
                        'var x = 5',
                        'x = 5',
                        'int x = 5',
                        'declare x = 5'
                    ],
                    'correct_answer': 1,
                    'explanation': 'In Python, you simply assign a value to a variable name without declaring its type.'
                },
                {
                    'question': 'Which Python data structure is ordered and changeable?',
                    'options': ['Tuple', 'Set', 'List', 'Dictionary'],
                    'correct_answer': 2,
                    'explanation': 'Lists in Python are ordered, changeable (mutable), and allow duplicate values.'
                },
                {
                    'question': 'What keyword is used to define a function in Python?',
                    'options': ['function', 'def', 'func', 'define'],
                    'correct_answer': 1,
                    'explanation': 'The "def" keyword is used to define a function in Python.'
                },
            ],
            'javascript': [
                {
                    'question': 'Which keyword is used to declare a block-scoped variable in JavaScript?',
                    'options': ['var', 'let', 'const', 'Both let and const'],
                    'correct_answer': 3,
                    'explanation': 'Both "let" and "const" declare block-scoped variables. "const" is for constants, "let" for variables that can be reassigned.'
                },
                {
                    'question': 'What does DOM stand for?',
                    'options': [
                        'Document Object Model',
                        'Data Object Model',
                        'Document Orientation Model',
                        'Display Object Manager'
                    ],
                    'correct_answer': 0,
                    'explanation': 'DOM stands for Document Object Model, which represents the structure of HTML documents.'
                },
                {
                    'question': 'Which method is used to add an element to the end of an array?',
                    'options': ['append()', 'push()', 'add()', 'insert()'],
                    'correct_answer': 1,
                    'explanation': 'The push() method adds one or more elements to the end of an array.'
                },
            ],
            'react': [
                {
                    'question': 'What is JSX in React?',
                    'options': [
                        'A JavaScript framework',
                        'A syntax extension for JavaScript',
                        'A CSS preprocessor',
                        'A testing library'
                    ],
                    'correct_answer': 1,
                    'explanation': 'JSX is a syntax extension for JavaScript that looks similar to HTML and is used in React to describe UI.'
                },
                {
                    'question': 'Which Hook is used to manage state in functional components?',
                    'options': ['useEffect', 'useState', 'useContext', 'useReducer'],
                    'correct_answer': 1,
                    'explanation': 'useState is the Hook that allows you to add state to functional components.'
                },
                {
                    'question': 'What is the virtual DOM in React?',
                    'options': [
                        'A real DOM element',
                        'A lightweight copy of the real DOM',
                        'A CSS framework',
                        'A testing tool'
                    ],
                    'correct_answer': 1,
                    'explanation': 'The virtual DOM is a lightweight copy of the actual DOM that React uses to optimize updates.'
                },
            ],
            'html-css': [
                {
                    'question': 'Which HTML tag is used to define a hyperlink?',
                    'options': ['<link>', '<a>', '<href>', '<url>'],
                    'correct_answer': 1,
                    'explanation': 'The <a> (anchor) tag is used to create hyperlinks in HTML.'
                },
                {
                    'question': 'Which CSS property is used to change text color?',
                    'options': ['text-color', 'font-color', 'color', 'text-style'],
                    'correct_answer': 2,
                    'explanation': 'The "color" property in CSS is used to change the color of text.'
                },
                {
                    'question': 'What does CSS stand for?',
                    'options': [
                        'Computer Style Sheets',
                        'Cascading Style Sheets',
                        'Creative Style Sheets',
                        'Colorful Style Sheets'
                    ],
                    'correct_answer': 1,
                    'explanation': 'CSS stands for Cascading Style Sheets, used to style HTML elements.'
                },
            ],
            'sql': [
                {
                    'question': 'Which SQL statement is used to extract data from a database?',
                    'options': ['GET', 'EXTRACT', 'SELECT', 'PULL'],
                    'correct_answer': 2,
                    'explanation': 'The SELECT statement is used to retrieve data from a database.'
                },
                {
                    'question': 'Which clause is used to filter results in SQL?',
                    'options': ['FILTER', 'WHERE', 'HAVING', 'IF'],
                    'correct_answer': 1,
                    'explanation': 'The WHERE clause is used to filter records based on specified conditions.'
                },
                {
                    'question': 'What does SQL stand for?',
                    'options': [
                        'Structured Query Language',
                        'Simple Query Language',
                        'System Query Language',
                        'Standard Question Language'
                    ],
                    'correct_answer': 0,
                    'explanation': 'SQL stands for Structured Query Language, used to manage relational databases.'
                },
            ],
        }

        # Generic questions for any topic
        self.generic_templates = [
            {
                'question': 'What is the primary purpose of {topic}?',
                'options': [
                    'To simplify development processes',
                    'To improve code organization',
                    'To enhance application performance',
                    'All of the above'
                ],
                'correct_answer': 3,
                'explanation': '{topic} serves multiple purposes including simplifying development, improving organization, and enhancing performance.'
            },
            {
                'question': 'Which skill is essential for mastering {topic}?',
                'options': [
                    'Understanding core concepts',
                    'Practical hands-on experience',
                    'Learning best practices',
                    'All of the above'
                ],
                'correct_answer': 3,
                'explanation': 'Mastering {topic} requires understanding concepts, gaining experience, and following best practices.'
            },
            {
                'question': 'What is the recommended approach for learning {topic}?',
                'options': [
                    'Reading documentation only',
                    'Watching video tutorials only',
                    'Combining theory with hands-on practice',
                    'Memorizing syntax'
                ],
                'correct_answer': 2,
                'explanation': 'The most effective way to learn {topic} is by combining theoretical knowledge with practical application.'
            },
        ]

    def generate_quiz(self, topic: str, difficulty: str = 'intermediate',
                     num_questions: int = 3) -> List[Dict]:
        """
        Generate quiz questions for a given topic

        Args:
            topic: Topic name (e.g., 'Python', 'JavaScript')
            difficulty: 'beginner', 'intermediate', or 'advanced'
            num_questions: Number of questions to generate (1-10)

        Returns:
            List of question dictionaries
        """
        # Normalize topic name
        topic_key = topic.lower().replace(' ', '-').replace('_', '-')

        # Get questions for this topic
        if topic_key in self.question_templates:
            questions = self.question_templates[topic_key].copy()
        else:
            # Use generic templates if topic not found
            questions = []
            for template in self.generic_templates[:num_questions]:
                q = template.copy()
                q['question'] = q['question'].replace('{topic}', topic)
                q['explanation'] = q['explanation'].replace('{topic}', topic)
                questions.append(q)

        # Ensure we don't exceed available questions
        num_questions = min(num_questions, len(questions))

        # Return requested number of questions
        return questions[:num_questions]

    def generate_explanation(self, topic: str, level: str = 'beginner') -> str:
        """Generate a simple explanation for a topic"""
        explanations = {
            'beginner': f"{topic} is a fundamental concept in software development. It's designed to help developers create applications more efficiently.",
            'intermediate': f"{topic} involves understanding core principles and applying them effectively in real-world scenarios. It requires practice and hands-on experience.",
            'advanced': f"{topic} encompasses advanced techniques and patterns that allow for sophisticated implementations and optimization strategies."
        }

        base_explanation = explanations.get(level, explanations['beginner'])

        return f"""
**Understanding {topic}**

{base_explanation}

**Key Concepts:**
- Start with the fundamentals
- Practice regularly with hands-on projects
- Study best practices and patterns
- Learn from real-world examples

**Why It Matters:**
{topic} is an essential skill for modern developers. It provides the tools and techniques needed to build robust, scalable applications.

**Next Steps:**
1. Start with official documentation
2. Follow guided tutorials
3. Build small projects
4. Join community discussions
5. Continue learning and practicing

Remember: The best way to learn {topic} is through consistent practice and real-world application!
"""

    def generate_summary(self, content: str, title: str = 'Resource') -> str:
        """Generate a simple summary of content"""
        word_count = len(content.split())

        return f"""
**Summary of: {title}**

**Overview:**
This resource covers important aspects of the topic with practical examples and explanations.

**Main Topics:**
- Core concepts and fundamentals
- Practical applications and use cases
- Best practices and recommendations
- Common pitfalls to avoid

**Key Takeaways:**
- Understanding the foundational principles is essential
- Practice is crucial for mastery
- Following best practices leads to better results

**Audience:**
This resource is suitable for learners at various levels, from beginners to advanced practitioners.

**Estimated Time:**
Based on the content length (~{word_count} words), this resource should take approximately {word_count // 200} to {word_count // 150} minutes to complete.

**Recommendation:**
Take notes while studying and try to apply the concepts in your own projects for better retention.
"""

    def generate_recommendations(self, current_competencies: List[str],
                                target_competencies: List[str]) -> str:
        """Generate learning recommendations"""

        return f"""
**Personalized Learning Recommendations**

**Your Current Skills:**
{', '.join(current_competencies) if current_competencies else 'Starting fresh - that\'s great!'}

**Target Goals:**
{', '.join(target_competencies) if target_competencies else 'Define your learning goals'}

**Recommended Next Steps:**

1. **Build Strong Foundations**
   - Master core concepts before moving to advanced topics
   - Practice fundamental skills daily
   - Complete beginner-friendly projects

2. **Follow a Structured Path**
   - Start with prerequisites
   - Progress gradually to more complex topics
   - Review and reinforce regularly

3. **Apply What You Learn**
   - Build real projects
   - Contribute to open source
   - Solve practical problems

4. **Join Learning Communities**
   - Participate in forums and discussions
   - Share your progress
   - Learn from others' experiences

5. **Stay Consistent**
   - Set aside dedicated learning time
   - Track your progress
   - Celebrate small wins

**Estimated Timeline:**
With consistent effort (5-10 hours/week), you can make significant progress in 3-6 months.

**Challenges to Watch For:**
- Trying to learn too much at once
- Skipping fundamentals
- Not practicing enough
- Getting discouraged by difficulties

**Stay Motivated:**
Remember that every expert was once a beginner. Progress may seem slow at first, but consistent effort leads to remarkable results. You've got this! 🚀
"""


# Create singleton instance
mock_quiz_generator = MockQuizGenerator()

# Export for use in other modules
__all__ = ['MockQuizGenerator', 'mock_quiz_generator']
