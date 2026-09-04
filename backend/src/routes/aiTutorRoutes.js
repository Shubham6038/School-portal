const express = require('express');
const router = express.Router();

const quizBank = {
  'Class 1': {
    Science: [
      { id: 1, question: 'Which part of a plant is green and makes food?', options: ['Root', 'Leaf', 'Stem', 'Flower'], correctIndex: 1, explanation: 'Leaves are green because of chlorophyll and make food for the plant.' },
      { id: 2, question: 'Which animal is known as the King of the Jungle?', options: ['Tiger', 'Elephant', 'Lion', 'Giraffe'], correctIndex: 2, explanation: 'Lion is commonly called the king of the jungle.' }
    ],
    Mathematics: [
      { id: 1, question: 'What is 5 + 4?', options: ['8', '9', '10', '7'], correctIndex: 1, explanation: '5 + 4 equals 9.' },
      { id: 2, question: 'Which number comes after 19?', options: ['18', '20', '21', '17'], correctIndex: 1, explanation: 'Counting forward after 19 gives 20.' }
    ]
  },
  'Class 2': {
    Science: [
      { id: 1, question: 'Which sense organ helps us to hear sounds?', options: ['Eyes', 'Nose', 'Ears', 'Skin'], correctIndex: 2, explanation: 'Ears help us to hear different sounds around us.' }
    ],
    Mathematics: [
      { id: 1, question: 'What is 15 - 7?', options: ['6', '8', '9', '7'], correctIndex: 1, explanation: '15 minus 7 is 8.' }
    ]
  },
  'Class 3': {
    Science: [
      { id: 1, question: 'Living things need which gas to breathe?', options: ['Carbon dioxide', 'Oxygen', 'Helium', 'Nitrogen'], correctIndex: 1, explanation: 'Humans and animals need oxygen to breathe.' }
    ],
    Mathematics: [
      { id: 1, question: 'How many sides does a triangle have?', options: ['3', '4', '5', '6'], correctIndex: 0, explanation: 'A triangle is a closed shape with 3 sides.' }
    ]
  },
  'Class 4': {
    Science: [
      { id: 1, question: 'Which state of matter has a definite shape and volume?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], correctIndex: 0, explanation: 'Solids maintain a fixed shape and fixed volume.' }
    ],
    Mathematics: [
      { id: 1, question: 'What is the product of 12 and 6?', options: ['62', '72', '82', '68'], correctIndex: 1, explanation: '12 multiplied by 6 is 72.' }
    ]
  },
  'Class 5': {
    Science: [
      { id: 1, question: 'Which organ pumps blood throughout the human body?', options: ['Lungs', 'Heart', 'Kidneys', 'Stomach'], correctIndex: 1, explanation: 'The heart pumps blood through the circulatory system.' }
    ],
    Mathematics: [
      { id: 1, question: 'What is the perimeter of a square with a side of 6 cm?', options: ['12 cm', '24 cm', '36 cm', '18 cm'], correctIndex: 1, explanation: 'Perimeter of a square = 4 * side = 4 * 6 = 24 cm.' }
    ]
  },
  'Class 6': {
    Science: [
      { id: 1, question: 'Which vitamin is produced in our body when exposed to sunlight?', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], correctIndex: 3, explanation: 'Sunlight triggers Vitamin D synthesis in the skin.' }
    ],
    Mathematics: [
      { id: 1, question: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], correctIndex: 2, explanation: '2 is the only even and the smallest prime number.' }
    ]
  },
  'Class 7': {
    Science: [
      { id: 1, question: 'What is the standard unit of temperature in the SI system?', options: ['Celsius', 'Fahrenheit', 'Kelvin', 'Joule'], correctIndex: 2, explanation: 'Kelvin (K) is the SI unit of temperature.' }
    ],
    Mathematics: [
      { id: 1, question: 'What is the value of (-5) * (-4)?', options: ['-20', '20', '-9', '9'], correctIndex: 1, explanation: 'Product of two negative integers is always positive.' }
    ]
  },
  'Class 8': {
    Science: [
      { id: 1, question: 'Which non-metal is a good conductor of electricity?', options: ['Graphite', 'Sulfur', 'Phosphorus', 'Coal'], correctIndex: 0, explanation: 'Graphite has free delocalized electrons that conduct electricity.' }
    ],
    Mathematics: [
      { id: 1, question: 'What is the square root of 625?', options: ['15', '25', '35', '45'], correctIndex: 1, explanation: '25 * 25 = 625.' }
    ]
  },
  'Class 9': {
    Science: [
      { id: 1, question: 'What is the value of acceleration due to gravity (g) on Earth?', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '9.2 m/s²'], correctIndex: 1, explanation: 'Average acceleration due to gravity on Earth is approximately 9.8 m/s².' }
    ],
    Mathematics: [
      { id: 1, question: 'A polynomial of degree 2 is called a:', options: ['Linear polynomial', 'Quadratic polynomial', 'Cubic polynomial', 'Constant'], correctIndex: 1, explanation: 'Degree 2 polynomials are called quadratic polynomials.' }
    ]
  },
  'Class 10': {
    Science: [
      { id: 1, question: 'Which gas is evolved when dilute hydrochloric acid reacts with zinc granules?', options: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Nitrogen'], correctIndex: 1, explanation: 'Zinc displaces hydrogen from acid: Zn + 2HCl -> ZnCl2 + H2.' },
      { id: 2, question: 'What is the focal length of a plane mirror?', options: ['Zero', 'Infinity', '1 meter', '10 cm'], correctIndex: 1, explanation: 'A flat plane mirror has infinite radius of curvature.' }
    ],
    Mathematics: [
      { id: 1, question: 'If discriminant D > 0 in a quadratic equation, the roots are:', options: ['Real and Equal', 'Real and Distinct', 'No Real Roots', 'Zero'], correctIndex: 1, explanation: 'D > 0 gives two distinct real roots.' },
      { id: 2, question: 'What is the 10th term of the AP: 2, 7, 12, ...?', options: ['45', '47', '50', '52'], correctIndex: 1, explanation: 'a10 = 2 + (9 * 5) = 47.' }
    ]
  }
};

router.post('/ask-doubt', async (req, res) => {
  try {
    const { question, subject, studentClass } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question cannot be empty' });
    }

    const q = question.toLowerCase();
    let responseText = '';

    if (q.includes('photosynthesis')) {
      responseText = `**Photosynthesis** is the process by which green plants use sunlight, water ($H_2O$), and carbon dioxide ($CO_2$) to synthesize glucose and release oxygen ($O_2$). \n\n**Equation:**\n$$6CO_2 + 6H_2O \\xrightarrow{Sunlight + Chlorophyll} C_6H_{12}O_6 + 6O_2$$`;
    } else if (q.includes('pythagoras') || q.includes('pythagorean')) {
      responseText = `**Pythagoras Theorem:** In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.\n\n$$Hypotenuse^2 = Base^2 + Perpendicular^2$$\n$$H^2 = B^2 + P^2$$`;
    } else if (q.includes('newton') && q.includes('law')) {
      responseText = `**Newton's 3 Laws of Motion:**\n1. **First Law (Inertia):** An object stays at rest or in motion unless acted on by an external force.\n2. **Second Law ($F = ma$):** Force equals mass multiplied by acceleration.\n3. **Third Law:** For every action, there is an equal and opposite reaction.`;
    } else if (q.includes('water cycle')) {
      responseText = `**The Water Cycle** consists of 4 primary stages:\n1. **Evaporation:** Sun heats water bodies turning liquid into vapor.\n2. **Transpiration:** Plants release water vapor into the air.\n3. **Condensation:** Vapor cools down to form clouds.\n4. **Precipitation:** Water falls back to earth as rain or snow.`;
    } else if (q.includes('quadratic')) {
      responseText = `**Quadratic Formula:** For any quadratic equation in standard form $ax^2 + bx + c = 0$, the roots are given by:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`;
    } else {
      responseText = `**Answer to your query on ${subject || 'Academics'} (${studentClass || 'Class 10'}):**\n\nTo solve "${question}", break the problem down step-by-step:\n- First identify the known values and formula.\n- Substitute the values into standard CBSE syllabus equations.\n- Write the concluding sentence with correct S.I. units.`;
    }

    return res.json({
      success: true,
      data: {
        reply: responseText,
        subject: subject || 'General Science',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });
  } catch (error) {
    console.error('AI Tutor API Error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing question' });
  }
});

router.post('/get-quiz', (req, res) => {
  const { studentClass, subject } = req.body;
  const targetClass = studentClass || 'Class 10';
  const targetSubject = subject || 'Science';

  const classData = quizBank[targetClass] || quizBank['Class 10'];
  const questions = classData[targetSubject] || classData['Science'] || [];

  return res.json({
    success: true,
    data: {
      studentClass: targetClass,
      subject: targetSubject,
      totalQuestions: questions.length,
      questions
    }
  });
});

module.exports = router;
