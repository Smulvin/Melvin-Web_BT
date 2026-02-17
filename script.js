const steps = document.querySelectorAll('.step');
const nextBtn = document.getElementById('next-step-button');
const prevBtn = document.getElementById('previous-step-button');
const submitBtn = document.getElementById('submit-button');

let currentStep = 0; // step1 = index 0
showStep(currentStep);

function showStep(index) {
    steps.forEach(step => step.classList.remove('active'));
    steps[index].classList.add('active');

    if (index === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }


    if (index === steps.length - 1) {
        nextBtn.type = 'submit';
        nextBtn.textContent = 'Verzenden';
    } else {
        nextBtn.type = 'button';  
        nextBtn.textContent = 'Volgende';
    }
}

nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
});
