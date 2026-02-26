import React, { useState } from 'react'
import VisualizationEngine from './VisualizationEngine'
import { Atom, Zap, Droplets, Leaf, Eye, Microscope } from 'lucide-react'

const ScienceVisualizer = ({ subject, topic, className = '' }) => {
  const [selectedDemo, setSelectedDemo] = useState('physics')
  const [animationSpeed, setAnimationSpeed] = useState(1)

  const scienceVisualizations = {
    physics: {
      icon: Zap,
      title: 'Physics Simulations',
      description: 'Motion, forces, and energy',
      demos: [
        {
          name: 'Projectile Motion',
          type: 'physics-motion',
          data: {
            type: 'projectile',
            velocity: 20,
            acceleration: 9.8,
            time: 4
          },
          explanation: "Objects follow a parabolic path when launched at an angle due to gravity."
        },
        {
          name: 'Uniform Motion',
          type: 'physics-motion',
          data: {
            type: 'uniform',
            velocity: 15,
            time: 5
          },
          explanation: "Objects moving at constant velocity travel equal distances in equal time intervals."
        },
        {
          name: 'Accelerated Motion',
          type: 'physics-motion',
          data: {
            type: 'accelerated',
            velocity: 5,
            acceleration: 3,
            time: 6
          },
          explanation: "Objects with constant acceleration increase their velocity uniformly over time."
        }
      ]
    },
    chemistry: {
      icon: Atom,
      title: 'Chemistry Models',
      description: 'Molecules and reactions',
      demos: [
        {
          name: 'Water Molecule (H₂O)',
          type: 'chemistry-molecule',
          data: {
            molecule: 'H₂O',
            atoms: [
              { element: 'O', x: 250, y: 200, radius: 25 },
              { element: 'H', x: 200, y: 170, radius: 15 },
              { element: 'H', x: 300, y: 170, radius: 15 }
            ],
            bonds: [
              { from: 0, to: 1, type: 'single' },
              { from: 0, to: 2, type: 'single' }
            ]
          },
          explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom at an angle of 104.5°."
        },
        {
          name: 'Methane (CH₄)',
          type: 'chemistry-molecule',
          data: {
            molecule: 'CH₄',
            atoms: [
              { element: 'C', x: 250, y: 200, radius: 20 },
              { element: 'H', x: 220, y: 170, radius: 12 },
              { element: 'H', x: 280, y: 170, radius: 12 },
              { element: 'H', x: 220, y: 230, radius: 12 },
              { element: 'H', x: 280, y: 230, radius: 12 }
            ],
            bonds: [
              { from: 0, to: 1, type: 'single' },
              { from: 0, to: 2, type: 'single' },
              { from: 0, to: 3, type: 'single' },
              { from: 0, to: 4, type: 'single' }
            ]
          },
          explanation: "Methane has a tetrahedral structure with carbon at the center bonded to four hydrogen atoms."
        },
        {
          name: 'Carbon Dioxide (CO₂)',
          type: 'chemistry-molecule',
          data: {
            molecule: 'CO₂',
            atoms: [
              { element: 'C', x: 250, y: 200, radius: 20 },
              { element: 'O', x: 180, y: 200, radius: 18 },
              { element: 'O', x: 320, y: 200, radius: 18 }
            ],
            bonds: [
              { from: 0, to: 1, type: 'double' },
              { from: 0, to: 2, type: 'double' }
            ]
          },
          explanation: "CO₂ is linear with carbon double-bonded to two oxygen atoms, making it a greenhouse gas."
        }
      ]
    },
    biology: {
      icon: Leaf,
      title: 'Biology Systems',
      description: 'Cells and life processes',
      demos: [
        {
          name: 'Animal Cell',
          type: 'biology-cell',
          data: {
            cellType: 'animal',
            organelles: [
              { type: 'nucleus', name: 'Nucleus', x: 250, y: 200, size: 40, color: '#8b5cf6' },
              { type: 'mitochondria', name: 'Mitochondria', x: 180, y: 150, size: 20, color: '#ef4444' },
              { type: 'mitochondria', name: 'Mitochondria', x: 320, y: 250, size: 20, color: '#ef4444' },
              { type: 'ribosome', name: 'Ribosomes', x: 200, y: 250, size: 8, color: '#10b981' },
              { type: 'ribosome', name: 'Ribosomes', x: 300, y: 150, size: 8, color: '#10b981' },
              { type: 'golgi', name: 'Golgi Body', x: 180, y: 220, size: 15, color: '#f59e0b' }
            ]
          },
          explanation: "Animal cells have a nucleus, mitochondria for energy, and various organelles for different functions."
        },
        {
          name: 'Plant Cell',
          type: 'biology-cell',
          data: {
            cellType: 'plant',
            organelles: [
              { type: 'nucleus', name: 'Nucleus', x: 250, y: 200, size: 35, color: '#8b5cf6' },
              { type: 'chloroplast', name: 'Chloroplast', x: 150, y: 150, size: 25, color: '#059669' },
              { type: 'chloroplast', name: 'Chloroplast', x: 350, y: 250, size: 25, color: '#059669' },
              { type: 'vacuole', name: 'Vacuole', x: 300, y: 180, size: 30, color: '#06b6d4' },
              { type: 'mitochondria', name: 'Mitochondria', x: 180, y: 250, size: 18, color: '#ef4444' }
            ]
          },
          explanation: "Plant cells have chloroplasts for photosynthesis, a large vacuole, and a rigid cell wall."
        }
      ]
    }
  }

  const getCurrentDemo = () => {
    return scienceVisualizations[selectedDemo]?.demos[0] || scienceVisualizations.physics.demos[0]
  }

  const [currentDemoIndex, setCurrentDemoIndex] = useState(0)
  const currentDemo = scienceVisualizations[selectedDemo]?.demos[currentDemoIndex] || getCurrentDemo()

  const scienceExplanations = {
    physics: {
      concepts: [
        "Newton's Laws of Motion govern how objects move",
        "Energy is conserved but can change forms",
        "Forces cause acceleration (F = ma)",
        "Gravity affects all objects equally"
      ],
      formulas: [
        "Distance = Speed × Time",
        "Force = Mass × Acceleration",
        "Kinetic Energy = ½mv²",
        "Potential Energy = mgh"
      ]
    },
    chemistry: {
      concepts: [
        "Atoms bond to form molecules",
        "Chemical reactions rearrange atoms",
        "Electrons determine bonding behavior",
        "Molecular shape affects properties"
      ],
      formulas: [
        "Avogadro's Number = 6.022 × 10²³",
        "PV = nRT (Ideal Gas Law)",
        "pH = -log[H⁺]",
        "Rate = k[A]ᵐ[B]ⁿ"
      ]
    },
    biology: {
      concepts: [
        "Cells are the basic units of life",
        "DNA contains genetic information",
        "Photosynthesis converts light to energy",
        "Evolution explains biodiversity"
      ],
      formulas: [
        "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
        "Cellular Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP",
        "Hardy-Weinberg: p² + 2pq + q² = 1",
        "Population Growth: dN/dt = rN"
      ]
    }
  }

  return (
    <div className={`space-y-4 md:space-y-6 p-3 md:p-4 ${className}`}>
      {/* Subject Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">Choose Science Subject</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {Object.entries(scienceVisualizations).map(([key, subject]) => {
            const Icon = subject.icon
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDemo(key)
                  setCurrentDemoIndex(0)
                }}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedDemo === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                }`}
              >
                <Icon className="h-8 w-8 mx-auto mb-3" />
                <div className="font-semibold">{subject.title}</div>
                <div className="text-sm text-gray-500 mt-1">{subject.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Demo Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
        <h4 className="text-sm md:text-base font-semibold mb-2 md:mb-3 text-gray-800">
          {scienceVisualizations[selectedDemo]?.title} Demonstrations
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {scienceVisualizations[selectedDemo]?.demos.map((demo, index) => (
            <button
              key={index}
              onClick={() => setCurrentDemoIndex(index)}
              className={`p-3 text-left rounded-lg border transition-colors ${
                currentDemoIndex === index
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 text-gray-700'
              }`}
            >
              <div className="font-medium">{demo.name}</div>
              <div className="text-sm text-gray-500 mt-1">{demo.explanation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
        <h4 className="text-sm md:text-base font-semibold mb-2 md:mb-3 text-gray-800">Animation Settings</h4>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Speed:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600">{animationSpeed}x</span>
        </div>
      </div>

      {/* Main Visualization */}
      <VisualizationEngine
        type={currentDemo.type}
        data={currentDemo.data}
        subject={selectedDemo}
      />

      {/* Explanation Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">
          🔬 Scientific Explanation
        </h3>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 md:p-4 mb-4 md:mb-6">
          <h4 className="text-sm md:text-base font-semibold text-blue-800 mb-2">{currentDemo.name}</h4>
          <p className="text-sm md:text-base text-blue-700">{currentDemo.explanation}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Key Concepts */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-purple-500" />
              Key Concepts
            </h4>
            <ul className="space-y-2">
              {scienceExplanations[selectedDemo]?.concepts.map((concept, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{concept}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Formulas */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Microscope className="h-5 w-5 mr-2 text-green-500" />
              Important Formulas
            </h4>
            <ul className="space-y-2">
              {scienceExplanations[selectedDemo]?.formulas.map((formula, index) => (
                <li key={index} className="bg-gray-50 p-2 rounded font-mono text-sm">
                  {formula}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive Questions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="font-semibold text-yellow-800 mb-3">🤔 Think About This:</h5>
          <div className="space-y-2 text-yellow-700">
            {selectedDemo === 'physics' && (
              <>
                <p>• What happens to the motion if we change the initial velocity?</p>
                <p>• How does gravity affect different objects?</p>
                <p>• Can you predict where the object will land?</p>
              </>
            )}
            {selectedDemo === 'chemistry' && (
              <>
                <p>• Why do atoms form bonds with each other?</p>
                <p>• How does molecular shape affect properties?</p>
                <p>• What determines the number of bonds an atom can form?</p>
              </>
            )}
            {selectedDemo === 'biology' && (
              <>
                <p>• What makes plant cells different from animal cells?</p>
                <p>• How do organelles work together in a cell?</p>
                <p>• Why are cells considered the basic units of life?</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Related Topics */}
      <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-gray-800">
          🔗 Related Topics to Explore
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {selectedDemo === 'physics' && [
            { title: 'Energy Conservation', description: 'How energy transforms but never disappears' },
            { title: 'Wave Motion', description: 'Understanding sound and light waves' },
            { title: 'Electromagnetic Forces', description: 'Electric and magnetic interactions' }
          ].map((topic, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="font-medium text-gray-800">{topic.title}</div>
              <div className="text-sm text-gray-600 mt-1">{topic.description}</div>
            </div>
          ))}
          
          {selectedDemo === 'chemistry' && [
            { title: 'Chemical Reactions', description: 'How molecules interact and change' },
            { title: 'Periodic Table', description: 'Organization of elements by properties' },
            { title: 'Acids and Bases', description: 'pH and chemical equilibrium' }
          ].map((topic, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="font-medium text-gray-800">{topic.title}</div>
              <div className="text-sm text-gray-600 mt-1">{topic.description}</div>
            </div>
          ))}
          
          {selectedDemo === 'biology' && [
            { title: 'Photosynthesis', description: 'How plants convert light to energy' },
            { title: 'DNA Structure', description: 'The blueprint of life' },
            { title: 'Evolution', description: 'How species change over time' }
          ].map((topic, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="font-medium text-gray-800">{topic.title}</div>
              <div className="text-sm text-gray-600 mt-1">{topic.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScienceVisualizer