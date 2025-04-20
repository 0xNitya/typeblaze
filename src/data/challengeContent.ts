// Content for different types of challenges
const challengeContent = {
  // Speed challenges - longer paragraphs for speed typing
  speed: [
    {
      id: "speed-1",
      content: "The art of typing quickly involves more than just moving your fingers fast. It's about developing muscle memory, proper hand positioning, and understanding the layout of your keyboard. Regular practice can dramatically improve your typing speed and accuracy. Many professional typists can achieve speeds of over 100 words per minute with near-perfect accuracy. As you practice more, your brain creates shortcuts and patterns that make typing feel more natural and effortless. The key is consistent practice and patience with yourself as you develop this valuable skill.",
      difficulty: "medium"
    },
    {
      id: "speed-2",
      content: "Quantum computing represents a significant leap in computational power. Unlike classical computers that use bits as the smallest unit of data, quantum computers use quantum bits or qubits. These qubits can exist in multiple states simultaneously due to a phenomenon called superposition, allowing quantum computers to process a vast number of possibilities at once. This capability makes them particularly suited for specific problems like cryptography, optimization, and simulating quantum systems. However, quantum computers are still in their early stages of development and face challenges related to error correction and maintaining quantum coherence.",
      difficulty: "hard"
    },
    {
      id: "speed-3",
      content: "Digital communication has transformed how we interact with one another, enabling instant connections across vast distances. Email, social media, video conferencing, and messaging apps have become integral parts of our daily lives, both professionally and personally. While these technologies offer unprecedented convenience and connectivity, they also raise important questions about privacy, security, and the quality of our relationships. Finding a balance between digital connection and face-to-face interaction remains an important consideration for maintaining meaningful human relationships in the digital age.",
      difficulty: "medium"
    },
    {
      id: "speed-4",
      content: "The human brain contains approximately 86 billion neurons, each forming thousands of connections with other neurons, creating a complex network capable of remarkable feats of cognition. This incredible organ, weighing just about three pounds, is responsible for our thoughts, emotions, memories, and consciousness itself. Neuroscientists continue to unravel its mysteries, developing ever more sophisticated tools and techniques to study its structure and function. Understanding the brain not only satisfies our curiosity about ourselves but also has important implications for treating neurological disorders and developing artificial intelligence systems inspired by neural architecture.",
      difficulty: "expert"
    }
  ],
  
  // Accuracy challenges - tricky text with punctuation and special characters
  accuracy: [
    {
      id: "accuracy-1",
      content: "She said, \"The meeting will be at 9:30 AM on Thursday, May 15th.\" Please ensure you're prepared with the Q1 & Q2 reports (both PDF & Excel formats). We'll need to discuss items #1-5 on the agenda, especially regarding the $12.5 million budget allocation for 2023/2024.",
      difficulty: "medium"
    },
    {
      id: "accuracy-2",
      content: "The pH of the solution was 7.4, within the acceptable range (6.8-7.8) for the experiment. Add 25μL of compound X-27β to 3.5mL of the buffer, maintaining the temperature at 37°C ± 0.5°. After 8 minutes, record the absorbance at λ=450nm and calculate the reaction rate using the formula: r = k[A]^2[B], where k=1.5×10^-3 mol^-1·L·s^-1.",
      difficulty: "hard"
    },
    {
      id: "accuracy-3",
      content: "Dear Mr. O'Reilly, Thank you for your inquiry dated 11/12/2022. We're pleased to confirm that your order (#JB-2023-456789) has been processed and will be shipped via FedEx® on Monday. The estimated delivery date is 18/12/2022 between 9:00-11:30 AM. For questions, please contact us at support@example.com or call +1 (555) 123-4567.",
      difficulty: "medium"
    },
    {
      id: "accuracy-4",
      content: "In the case of Smith v. Johnson (2018), the court held that \"the plaintiff's claim under Section 501(c)(3) was invalid per se.\" This decision was upheld in 75% of subsequent cases, creating what legal scholars call a \"de facto precedent\" in at least 12 jurisdictions. However, the dissenting opinion raised important questions about the applicability of the Foreign Corrupt Practices Act (FCPA) in such cases—particularly regarding the ≈$1.2M in disputed assets.",
      difficulty: "expert"
    }
  ],
  
  // Endurance challenges - long, repetitive text that requires focus
  endurance: [
    {
      id: "endurance-1",
      content: "The steady rhythm of practice is the foundation of mastery. When we commit to regular, deliberate practice, we gradually develop skills that once seemed impossible. This process requires patience and persistence through plateaus and setbacks. Every expert was once a beginner who simply continued showing up day after day. Progress is rarely linear; there are breakthroughs and regressions, moments of flow and periods of frustration. The key is maintaining consistency even when motivation wanes. Each practice session builds upon the last, creating a compound effect that, over time, leads to remarkable improvement. By embracing the journey rather than fixating on results, we can find joy in the process of growth itself. Remember that mastery is not a destination but a path of continuous learning and refinement that extends throughout our entire lives. The satisfaction comes not just from achieving goals but from the person we become through dedicated practice.",
      difficulty: "medium"
    },
    {
      id: "endurance-2",
      content: "The quantum nature of reality challenges our intuition at every turn. Particles can exist in multiple states simultaneously until observed. Information can be teleported instantaneously across vast distances. Empty space itself buzzes with virtual particles popping in and out of existence. These strange phenomena occur reliably in laboratories around the world, confirming the accuracy of quantum mechanical models. Yet despite over a century of research, physicists still debate the interpretations of these mathematical formalisms. Does the wave function represent reality itself or merely our knowledge about reality? Do parallel universes continuously branch off from our own? Is there a deeper theory that would unify quantum mechanics with general relativity? While practical applications of quantum physics have revolutionized technology through innovations like lasers, MRI machines, and semiconductor electronics, the fundamental questions about reality remain tantalizingly open. This curious situation places us in an unprecedented position in the history of science: we have equations that predict experimental results with astonishing precision, yet we cannot agree on what these equations tell us about the nature of reality.",
      difficulty: "hard"
    },
    {
      id: "endurance-3",
      content: "The development of artificial general intelligence poses profound questions for humanity. Unlike narrow AI systems designed for specific tasks, AGI would possess the ability to understand, learn, and apply knowledge across domains—similar to human intelligence but potentially far more powerful. The path to creating such systems involves numerous technical challenges, from developing more sophisticated learning algorithms to designing appropriate reward functions that align with human values. Beyond the technical hurdles lie ethical considerations of unprecedented importance. How would we ensure that AGI systems act in accordance with human welfare? What governance structures would be appropriate for managing the transition to a world with superintelligent entities? Who would control these systems, and how would their benefits be distributed? The possibility of intelligence explosion—where AI systems capable of improving themselves enter a rapid cycle of self-enhancement—adds urgency to these questions. Some researchers argue for extreme caution, suggesting that getting AGI alignment wrong could pose existential risks. Others emphasize the potential benefits: solutions to currently intractable problems in medicine, climate science, and other domains that could improve billions of lives. This tension between opportunity and risk defines the AGI conversation. Navigating this territory successfully will require unprecedented cooperation between technical experts, ethicists, policymakers, and representatives from diverse global communities.",
      difficulty: "expert"
    },
  ],
  
  // Precision challenges - mix of texts with complex patterns
  precision: [
    {
      id: "precision-1",
      content: "The marketing team will meet on Monday (10/15) to discuss Q4 strategies. Please bring your data on campaigns A1, B2, and C3—specifically conversion rates and ROI figures. We'll need to compare performance across desktop (Windows/Mac) and mobile (iOS/Android) platforms for users in the 18-24, 25-34, and 35+ demographics. Don't forget to prepare a brief summary of the 5-7 key findings from last quarter's report.",
      difficulty: "medium"
    },
    {
      id: "precision-2",
      content: "Patient presented with the following vital signs: BP 128/84 mmHg, HR 72 bpm, RR 16/min, SpO2 98% on room air, temperature 37.2°C. Laboratory results showed: Hb 14.3 g/dL, WBC 7.5×10^9/L, platelets 250×10^9/L, Na+ 139 mmol/L, K+ 4.1 mmol/L, glucose 5.4 mmol/L, creatinine 85 μmol/L. ECG revealed normal sinus rhythm at 70 bpm with PR interval 160ms, QRS duration 90ms, QTc 420ms, and no ST-T wave abnormalities. Chest X-ray (PA view) was unremarkable with clear lung fields and normal cardiac silhouette.",
      difficulty: "hard"
    },
    {
      id: "precision-3",
      content: "The architectural specifications require 2×4 lumber (actual dimensions: 1.5\"×3.5\") spaced 16\" on-center for all load-bearing walls. Floor joists should be 2×10 (actual: 1.5\"×9.25\") at 12\" O.C. for spans >14'. Use 5/8\" Type X drywall for fire-rated assemblies and ½\" regular drywall elsewhere. All exterior sheathing must be 7/16\" OSB with H-clips between rafters. Roof pitch is specified at 6:12 for the main structure and 4:12 for the attached garage, with 30# felt underlayment beneath 25-year architectural shingles (110 mph wind rating).",
      difficulty: "expert"
    },
  ],
  
  // Code challenges - programming code snippets for the "Code Ninja" challenge
  code: [
    {
      id: "code-1",
      content: `function calculateFibonacci(n) {
  if (n <= 1) return n;
  
  let fib = [0, 1];
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i-1] + fib[i-2];
  }
  
  return fib[n];
}

// Calculate the first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`Fibonacci(\${i}) = \${calculateFibonacci(i)}\`);
}`,
      language: "javascript",
      difficulty: "medium"
    },
    {
      id: "code-2",
      content: `function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// Example usage
const unsortedArray = [3, 6, 8, 10, 1, 2, 1];
const sortedArray = quickSort(unsortedArray);
console.log("Original array:", unsortedArray);
console.log("Sorted array:", sortedArray);`,
      language: "javascript",
      difficulty: "hard"
    },
    {
      id: "code-3",
      content: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  // Add a node to the end of the list
  append(data) {
    const newNode = new Node(data);
    
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    
    this.size++;
  }
  
  // Insert a node at a specific position
  insertAt(data, index) {
    if (index < 0 || index > this.size) {
      return false;
    }
    
    const newNode = new Node(data);
    
    if (index === 0) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      let current = this.head;
      let previous = null;
      let count = 0;
      
      while (count < index) {
        previous = current;
        current = current.next;
        count++;
      }
      
      newNode.next = current;
      previous.next = newNode;
    }
    
    this.size++;
    return true;
  }
  
  // Print the linked list
  printList() {
    let current = this.head;
    let result = '';
    
    while (current) {
      result += current.data + ' -> ';
      current = current.next;
    }
    
    console.log(result + 'null');
  }
}

// Example usage
const list = new LinkedList();
list.append(10);
list.append(20);
list.append(30);
list.insertAt(15, 1);
list.printList();`,
      language: "javascript",
      difficulty: "expert"
    },
    {
      id: "code-4",
      content: `import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setCount(prevCount => prevCount + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const handleStart = () => {
    setIsRunning(true);
  };
  
  const handleStop = () => {
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setCount(0);
    setIsRunning(false);
  };
  
  return (
    <div>
      <h2>Counter: {count}</h2>
      <div>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default Counter;`,
      language: "javascript",
      difficulty: "medium"
    }
  ]
};

export default challengeContent; 