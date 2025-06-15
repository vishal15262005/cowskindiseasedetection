// Health Analytics Functions
document.addEventListener('DOMContentLoaded', function() {
    const analyticsForm = document.getElementById('analyticsForm');
    if (analyticsForm) {
        analyticsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            analyzeHealth();
        });
    }
});

function analyzeHealth() {
    try {
        // Get form values
        const animalId = document.getElementById('animalId').value;
        const age = parseInt(document.getElementById('ageMonths').value);
        const milkingStatus = document.getElementById('milkingStatus').value;
        const weight = parseFloat(document.getElementById('weight').value) || calculateEstimatedWeight(age);
        const feedingPattern = document.getElementById('feedingPattern').value;

        // Validate inputs
        if (!animalId || !age || !milkingStatus || !feedingPattern) {
            alert('Please fill in all required fields');
            return;
        }

        // Calculate growth rate
        const growthRate = calculateGrowthRate(age, weight, feedingPattern);
        
        console.log('Calculated values:', {
            growthRate,
            weight,
            age,
            milkingStatus,
            feedingPattern
        });

        // Update UI elements
        updateScoreCard(growthRate);
        updateGrowthChart(age, weight);
        updateSuggestions(age, milkingStatus, growthRate, weight);
        updatePrediction(age, weight);

        // Show results section with animation
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            setTimeout(() => {
                resultsSection.classList.add('show');
            }, 100);
        }

        console.log('Analysis completed successfully');

    } catch (error) {
        console.error('Error during analysis:', error);
        // Silently log error without showing alert
    }
}

// Add error checking to calculation functions
function calculateGrowthRate(age, weight, feedingPattern) {
    if (!age || !weight || !feedingPattern) {
        throw new Error('Missing required parameters for growth rate calculation');
    }

    // Ideal weights at different ages
    const idealWeights = {
        6: 150,
        12: 250,
        18: 350,
        24: 400
    };

    const nearestAge = Object.keys(idealWeights)
        .reduce((prev, curr) => 
            Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
        );

    const idealWeight = idealWeights[nearestAge];
    const growthRate = (weight / idealWeight) * 100;

    const feedingFactors = {
        organic: 1.1,
        mixed: 1.0,
        commercial: 0.9
    };

    const adjustedRate = growthRate * feedingFactors[feedingPattern];

    if (isNaN(adjustedRate)) {
        throw new Error('Growth rate calculation failed');
    }

    return adjustedRate;
}

function updateScoreCard(score) {
    const scoreValue = document.getElementById('scoreValue');
    const scoreStatus = document.getElementById('scoreStatus');
    const scoreProgress = document.getElementById('scoreProgress');
    
    scoreValue.textContent = `${Math.round(score)}%`;
    scoreProgress.style.width = `${score}%`;
    
    if (score >= 80) {
        scoreStatus.textContent = 'Excellent';
        scoreValue.style.color = '#4CAF50';
        scoreProgress.style.backgroundColor = '#4CAF50';
    } else if (score >= 60) {
        scoreStatus.textContent = 'Normal';
        scoreValue.style.color = '#FFC107';
        scoreProgress.style.backgroundColor = '#FFC107';
    } else {
        scoreStatus.textContent = 'Needs Attention';
        scoreValue.style.color = '#F44336';
        scoreProgress.style.backgroundColor = '#F44336';
    }
}

function updateGrowthChart(currentAge, currentWeight) {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    const months = Array.from({length: 24}, (_, i) => i + 1);
    const idealWeights = months.map(m => calculateIdealWeight(m));
    const actualWeights = months.map(m => 
        m === currentAge ? currentWeight : null
    );

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Ideal Growth',
                    data: idealWeights,
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Current Weight',
                    data: actualWeights,
                    borderColor: '#2196F3',
                    backgroundColor: '#2196F3',
                    pointRadius: 8,
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age (Months)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                }
            }
        }
    });
}

function updateSuggestions(age, milkingStatus, growthRate, weight) {
    const suggestions = [];
    
    // Age-based recommendations
    if (age < 6) {
        suggestions.push('🍼 Ensure proper colostrum/milk feeding');
        suggestions.push('💪 Monitor early growth development');
    }

    // Milking status recommendations
    if (milkingStatus === 'no' && age >= 18) {
        suggestions.push('⚠️ Check hormonal health and pregnancy status');
        suggestions.push('👨‍⚕️ Schedule reproductive health check');
    }
    
    // Growth rate based recommendations
    if (growthRate < 60) {
        suggestions.push('🥩 Increase protein content in feed');
        suggestions.push('💊 Consider vitamin supplements');
        suggestions.push('📋 Review current feeding program');
    } else if (growthRate < 80) {
        suggestions.push('📈 Monitor growth rate closely');
        suggestions.push('🥗 Consider feed quality improvements');
    }
    
    // Weight-based recommendations
    if (weight < calculateIdealWeight(age) * 0.8) {
        suggestions.push('🔍 Check for internal parasites - deworming recommended');
        suggestions.push('🌾 Evaluate feed quality and quantity');
        suggestions.push('🏥 Schedule veterinary check-up');
    }

    // General health recommendations
    suggestions.push('💧 Ensure constant access to clean water');
    suggestions.push('🌡️ Monitor body temperature regularly');
    suggestions.push('🧹 Maintain clean housing conditions');

    // Update the suggestions list with animation
    const suggestionsList = document.getElementById('suggestionsList');
    if (suggestionsList) {
        suggestionsList.innerHTML = suggestions
            .map(s => `<li class="suggestion-item">${s}</li>`)
            .join('');
        
        // Add animation to suggestions
        const items = suggestionsList.getElementsByClassName('suggestion-item');
        Array.from(items).forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

function updatePrediction(currentAge, currentWeight) {
    const monthsTo18 = Math.max(0, 18 - currentAge);
    const expectedWeight = calculateExpectedWeight(currentWeight, monthsTo18);
    const idealWeight = calculateIdealWeight(18);

    const predictionText = document.getElementById('predictionText');
    predictionText.textContent = 
        `At 18 months, cow is expected to reach ${Math.round(expectedWeight)} kg (ideal: ${idealWeight} kg)`;
}

// Utility Functions
function calculateIdealWeight(age) {
    // Simplified weight calculation
    return 100 + (age * 16.67);
}

function calculateExpectedWeight(currentWeight, monthsToGrow) {
    // Simple linear growth projection
    return currentWeight + (monthsToGrow * 15);
}

function calculateEstimatedWeight(age) {
    // Fallback weight estimation if not provided
    return calculateIdealWeight(age) * 0.9;
}

// Action Button Functions
function saveProfile() {
    // Implementation for saving profile
    alert('Profile saved successfully!');
}

function setReminder() {
    // Implementation for setting reminder
    const date = new Date();
    date.setDate(date.getDate() + 30);
    alert(`Reminder set for next analysis on ${date.toLocaleDateString()}`);
}

function shareWithVet() {
    // Implementation for sharing with vet
    const message = encodeURIComponent(
        `Health Analytics Report:\n` +
        `Growth Rate: ${document.getElementById('scoreValue').textContent}\n` +
        `Status: ${document.getElementById('scoreStatus').textContent}\n` +
        `Recommendations: ${document.getElementById('suggestionsList').innerText}`
    );
    window.open(`https://wa.me/?text=${message}`);
}

function showResults() {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.classList.remove('hidden');
    setTimeout(() => resultsSection.classList.add('show'), 100);
}

// Carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.stat-card');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    
    let currentIndex = 0;
    const cardWidth = 300 + 24; // card width + gap
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
    
    prevBtn.addEventListener('click', () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        updateCarousel();
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = Math.min(currentIndex + 1, cards.length - 3);
        updateCarousel();
    });
});

// Auto-duplicate cards for infinite scroll
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.stat-card');
    
    // Clone cards and append to track
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    // Reset animation when it ends
    track.addEventListener('animationend', () => {
        track.style.animation = 'none';
        track.offsetHeight; // Trigger reflow
        track.style.animation = 'scrollCards 30s linear infinite';
    });

    // Pause animation on hover
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });

    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
});