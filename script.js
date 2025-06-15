document.addEventListener('DOMContentLoaded', function() {
    // Initialize counters
    const cowCounter = new CountUp('cowCount', 0, 1000);
    const dogCounter = new CountUp('dogCount', 0, 800);
    const accuracyCounter = new CountUp('accuracyCount', 0, 90);
    
    // Start counters when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cowCounter.start();
                dogCounter.start();
                accuracyCounter.start();
            }
        });
    });
    
    observer.observe(document.querySelector('.stats'));

    // Slideshow functionality
    const slideshow = document.getElementById('slideshow');
    const slides = slideshow.getElementsByClassName('slideshow-image');
    let currentSlide = 0;

    function nextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
    }

    // Start slideshow
    if (slides.length > 0) {
        // Make sure first slide is visible
        slides[0].classList.add('active');
        // Change slide every 5 seconds
        setInterval(nextSlide, 5000);
    }
});

function selectAnimal(type) {
    document.getElementById('animal-type').value = type;
    document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('image-upload');
    const animalType = document.getElementById('animal-type').value;
    
    formData.append('file', fileInput.files[0]);
    formData.append('animal_type', animalType);
    
    try {
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Analyzing...';
        
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        function handleDiseaseDetection(result) {
            const previewSection = document.getElementById('preview');
            const resultSection = document.getElementById('result');
            const warningDiv = document.getElementById('disease-warning');
            const predictionText = document.getElementById('prediction-text');
            const confidenceText = document.getElementById('confidence-text');
            const diseaseInfo = document.getElementById('disease-info');
            
            // Reset classes and content
            previewSection.classList.remove('disease-detected');
            resultSection.classList.remove('disease-detected');
            warningDiv.classList.remove('visible');
            diseaseInfo.innerHTML = '';
            
            // Check if disease is detected
            const isDiseaseDetected = result.prediction.toLowerCase() !== 'healthy';
            
            if (isDiseaseDetected) {
                previewSection.classList.add('disease-detected');
                resultSection.classList.add('disease-detected');
                warningDiv.classList.add('visible');
                predictionText.style.color = '#d32f2f';
                
                // Add disease information based on the prediction
                const diseaseDetails = getDiseaseInformation(result.prediction);
                diseaseInfo.innerHTML = `
                    <div class="disease-details">
                        <h3>About ${result.prediction}</h3>
                        <div class="info-section">
                            <h4>Description</h4>
                            <p>${diseaseDetails.description}</p>
                        </div>
                        <div class="info-section">
                            <h4>Stages</h4>
                            <ul>
                                ${diseaseDetails.stages.map(stage => `<li>${stage}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="info-section">
                            <h4>Treatment Recommendations</h4>
                            <ul>
                                ${diseaseDetails.treatment.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                predictionText.style.color = '#4CAF50';
                // Add precautions for healthy animals
                diseaseInfo.innerHTML = `
                    <div class="precautions-details">
                        <h3>Preventive Care Tips</h3>
                        <ul>
                            ${getPreventiveCare().map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            // Update result text
            predictionText.textContent = `Disease: ${result.prediction}`;
            confidenceText.textContent = `Confidence: ${(result.confidence * 100).toFixed(2)}%`;
        }

        if (result.error) {
            alert(result.error);
            return;
        }
        
        document.getElementById('preview-img').src = canvas.toDataURL('image/jpeg');
        // or URL.createObjectURL(file) for file upload
        document.getElementById('preview').classList.add('active');
        
        handleDiseaseDetection(result);
        document.getElementById('result').classList.remove('hidden');
        
        submitButton.disabled = false;
        submitButton.textContent = 'Detect Disease';
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image');
    }
});

function getDiseaseInformation(disease) {
    const diseaseInfo = {
        'lsd': {
            description: 'Lumpy Skin Disease (LSD) is a viral disease affecting cattle, characterized by nodules on the skin and internal organs.',
            stages: [
                'Initial fever and enlarged lymph nodes',
                'Development of firm, round nodules on skin',
                'Lesions may become necrotic',
                'Secondary bacterial infections possible'
            ],
            treatment: [
                'Isolate affected animals immediately',
                'Provide supportive care and good nutrition',
                'Administer antibiotics for secondary infections',
                'Implement fly control measures',
                'Contact veterinarian for specific treatment plan'
            ]
        },
        'fungal_infection': {
            description: 'A skin condition in dogs caused by various types of fungi, leading to irritation and hair loss.',
            stages: [
                'Initial redness and irritation',
                'Hair loss in affected areas',
                'Development of circular lesions',
                'Possible secondary bacterial infection'
            ],
            treatment: [
                'Apply prescribed antifungal medications',
                'Keep affected areas clean and dry',
                'Regular bathing with medicated shampoo',
                'Monitor for spreading of infection',
                'Complete full course of treatment'
            ]
        },
        'hypersensitivity_allergy': {
            description: 'An overreaction of the immune system to environmental allergens, causing skin irritation in dogs.',
            stages: [
                'Initial itching and discomfort',
                'Redness and inflammation',
                'Development of hot spots',
                'Chronic skin changes if untreated'
            ],
            treatment: [
                'Identify and avoid allergen triggers',
                'Use prescribed antihistamines or steroids',
                'Regular bathing with hypoallergenic shampoo',
                'Dietary modifications if recommended',
                'Consider immunotherapy for severe cases'
            ]
        }
    };
    
    return diseaseInfo[disease.toLowerCase()] || {};
}

function getPreventiveCare() {
    return [
        'Schedule regular veterinary check-ups',
        'Maintain proper vaccination schedule',
        'Practice good hygiene and grooming',
        'Provide balanced nutrition',
        'Ensure clean living environment',
        'Monitor for any changes in behavior or appearance',
        'Implement proper parasite control',
        'Maintain regular exercise routine'
    ];
}

function generatePDF(result) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(22);
    doc.setTextColor(76, 175, 80);
    doc.text("Animal Disease Detection Report", 105, 20, { align: "center" });
    
    // Add date and time
    doc.setFontSize(12);
    doc.setTextColor(100);
    const date = new Date().toLocaleString();
    doc.text(`Generated on: ${date}`, 20, 30);
    
    // Add detection results
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Detection Results", 20, 45);
    
    doc.setFontSize(14);
    doc.text(`Disease: ${result.prediction}`, 20, 55);
    doc.text(`Confidence: ${(result.confidence * 100).toFixed(2)}%`, 20, 65);
    
    // Add disease information if disease detected
    if (result.prediction.toLowerCase() !== 'healthy') {
        const diseaseInfo = getDiseaseInfo(result.prediction);
        
        doc.setFontSize(16);
        doc.text("Disease Information", 20, 85);
        
        doc.setFontSize(14);
        doc.text("Description:", 20, 95);
        const descLines = doc.splitTextToSize(diseaseInfo.description, 170);
        doc.text(descLines, 20, 105);
        
        doc.text("Stages:", 20, 125);
        let yPos = 135;
        diseaseInfo.stages.forEach(stage => {
            doc.text(`• ${stage}`, 25, yPos);
            yPos += 10;
        });
        
        doc.text("Treatment Recommendations:", 20, yPos + 10);
        yPos += 20;
        diseaseInfo.treatment.forEach(treatment => {
            doc.text(`• ${treatment}`, 25, yPos);
            yPos += 10;
        });
    } else {
        // Add preventive care tips for healthy animals
        doc.setFontSize(16);
        doc.text("Preventive Care Recommendations", 20, 85);
        
        doc.setFontSize(14);
        let yPos = 95;
        getPreventiveCare().forEach(tip => {
            doc.text(`• ${tip}`, 25, yPos);
            yPos += 10;
        });
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("This report was generated automatically by the Animal Disease Detection System", 105, 280, { align: "center" });
    
    // Save the PDF
    const filename = `disease-detection-report-${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
}

let currentLang = localStorage.getItem('preferred-language') || 'en';

function toggleLanguageMenu() {
    const menu = document.getElementById('languageMenu');
    menu.classList.toggle('show');
}

function updateNewsTickerContent(newsItems) {
    const tickerContent = document.querySelector('.ticker-content');
    if (tickerContent) {
        tickerContent.innerHTML = newsItems.map(item => 
            `<span class="ticker-item">${item}</span>`
        ).join('');
    }
}

function changeLanguage(lang) {
    const t = window.translations[lang];
    
    try {
        // Update hero section
        document.getElementById('mainTitle').textContent = t.title;
        document.getElementById('mainSubtitle').textContent = t.subtitle;
        document.getElementById('mainDescription').textContent = t.subtext;

        // Update buttons
        const ctaButtons = document.querySelectorAll('.cta-buttons .cta-button');
        ctaButtons[0].textContent = t.detectCow;
        ctaButtons[1].textContent = t.detectDog;
        
        // Update news ticker
        updateNewsTickerContent(t.newsItems);
        
        // Update vet section
        const vetTitle = document.querySelector('.vet-section .section-title');
        if (vetTitle) vetTitle.textContent = t.bookVet;
        
        const vetDesc = document.querySelector('.vet-section p');
        if (vetDesc) vetDesc.textContent = t.vetDesc;
        
        const bookBtn = document.querySelector('.vet-cta');
        if (bookBtn) bookBtn.textContent = t.bookBtn;
        
        // Update video section
        const videoTitle = document.querySelector('.video-section .section-title');
        if (videoTitle) videoTitle.textContent = t.educationTitle;
        
        // Update video titles
        const videoTitles = document.querySelectorAll('.video-card h3');
        if (videoTitles && videoTitles.length >= 3) {
            videoTitles[0].textContent = t.videoTitles.cowPrevention;
            videoTitles[1].textContent = t.videoTitles.dogSkinCare;
            videoTitles[2].textContent = t.videoTitles.animalHealth;
        }
        
        // Update Analytics section
        document.querySelector('.analytics-section .section-title').textContent = t.analytics.title;
        document.querySelector('.analytics-section .section-subtitle').textContent = t.analytics.subtitle;
        document.querySelector('.analytics-cta').innerHTML = t.analytics.buttonText;
        
        // Save preference
        localStorage.setItem('preferred-language', lang);
        document.querySelector('.current-lang').textContent = lang.toUpperCase();
    } catch (error) {
        console.error('Error updating language:', error);
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    changeLanguage(savedLang);
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('languageMenu');
    const btn = document.querySelector('.settings-btn');
    if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// Add this function to both detection pages
function updatePageTranslations(lang) {
    const t = window.translations[lang].detection;
    
    // Update page title and headers
    document.title = t.cowTitle; // or t.dogTitle for dog page
    document.querySelector('.page-title').textContent = t.cowTitle; // or t.dogTitle
    
    // Update camera section
    document.querySelector('.method-card h2').textContent = t.useCamera;
    document.getElementById('start-camera').textContent = t.turnOnCamera;
    document.getElementById('capture-btn').textContent = t.captureImage;
    
    // Update divider
    document.querySelector('.method-divider span').textContent = t.or;
    
    // Update upload section
    document.querySelector('.method-card:nth-child(3) h2').textContent = t.uploadImage;
    document.querySelector('.upload-btn').textContent = t.chooseFile;
    document.querySelector('.submit-btn').textContent = t.analyzeImage;
    
    // Update preview section
    document.querySelector('.preview-section h3').textContent = t.imagePreview;
    
    // Update result section
    document.querySelector('.result-title').textContent = t.detectionResult;
    document.querySelector('.download-btn').innerHTML = 
        `<span class="download-icon">📥</span>${t.downloadReport}`;
}

// Add event listener for language changes
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    updatePageTranslations(savedLang);
});

// Listen for language changes
window.addEventListener('storage', (e) => {
    if (e.key === 'preferred-language') {
        updatePageTranslations(e.newValue);
    }
});

function toggleChat() {
    const chatBody = document.getElementById('chatBody');
    chatBody.classList.toggle('minimized');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Process message and get response
    const response = processUserMessage(message);
    
    // Add bot response with slight delay
    setTimeout(() => {
        addMessage(response, 'bot');
    }, 500);
}

function addMessage(text, type) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function processUserMessage(message) {
    const lowerMsg = message.toLowerCase();

    // LSD Information
    if (lowerMsg.includes('lsd') || (lowerMsg.includes('lumpy') && lowerMsg.includes('skin'))) {
        return `# Lumpy Skin Disease (LSD)

📋 **Overview**:
- Viral disease caused by Capripoxvirus
- Highly contagious among cattle
- Economic impact on dairy production

🔍 **Symptoms**:
1. High fever (>40.5°C)
2. Firm nodules on skin (2-5 cm)
3. Reduced milk production
4. Enlarged lymph nodes
5. Nasal discharge
6. Loss of appetite

⚠️ **Stages**:
1. Incubation (4-7 days)
2. Fever phase (1-2 days)
3. Nodule development (2-4 days)
4. Lesion formation (4-7 days)
5. Recovery (2-4 weeks)

💉 **Treatment & Prevention**:
- Isolation of infected animals
- Supportive care
- Vaccination program
- Vector control
- Good hygiene practices

Contact a veterinarian immediately for proper treatment!`;
    }

    // Fungal Infection Information
    if (lowerMsg.includes('fungal')) {
        return `# Fungal Infections in Dogs

📋 **Overview**:
- Common skin infection (Ringworm)
- Caused by dermatophytes
- Highly contagious

🔍 **Symptoms**:
1. Circular patches
2. Hair loss
3. Scaly/crusty skin
4. Redness
5. Itching
6. Inflammation

⚠️ **Stages**:
1. Initial contact
2. Colonization (2-4 days)
3. Active infection (7-14 days)
4. Spread if untreated
5. Recovery with treatment

🏥 **Treatment**:
- Antifungal medications
- Medicated shampoos
- Regular cleaning
- Environmental decontamination
- Complete treatment course

Seek veterinary care for proper diagnosis and treatment plan.`;
    }

    // Hypersensitivity/Allergies Information
    if (lowerMsg.includes('allergy') || lowerMsg.includes('allergies')) {
        return `# Dog Allergies/Hypersensitivity

📋 **Overview**:
- Immune system overreaction
- Can be seasonal or year-round
- Multiple potential triggers

🔍 **Common Signs**:
1. Excessive scratching
2. Red/inflamed skin
3. Hot spots
4. Hair loss
5. Ear infections
6. Paw licking

⚠️ **Types**:
- Food allergies
- Environmental allergies
- Flea allergies
- Contact allergies

💊 **Management**:
1. Identify triggers
2. Eliminate allergens
3. Medication as prescribed
4. Regular bathing
5. Diet modification
6. Environmental control

Consult your vet for an allergy management plan.`;
    }

    // Prevention Guidelines
    if (lowerMsg.includes('prevent')) {
        return `# Disease Prevention Guidelines

🐮 **For Cows**:
1. Regular health checks
2. Vaccination schedule
3. Clean housing
4. Proper nutrition
5. Pest control
6. Quarantine procedures

🐕 **For Dogs**:
1. Regular grooming
2. Balanced diet
3. Exercise routine
4. Flea/tick prevention
5. Clean environment
6. Vet check-ups

⚕️ **General Tips**:
- Monitor daily behavior
- Keep records
- Maintain hygiene
- Early intervention`;
    }

    // Emergency Signs
    if (lowerMsg.includes('emergency')) {
        return `# Emergency Warning Signs

🚨 **Immediate Vet Care Needed If**:

🐮 **Cows**:
1. Severe bloating
2. Difficulty breathing
3. Collapse
4. High fever
5. Severe diarrhea
6. Labor difficulties

🐕 **Dogs**:
1. Breathing problems
2. Severe vomiting
3. Seizures
4. Collapse
5. Bloated abdomen
6. Severe bleeding

⚠️ **Contact Vet Immediately For**:
- Sudden behavior changes
- Loss of consciousness
- Severe pain signs
- Trauma/injuries`;
    }

    // Add more responses as needed...
}
