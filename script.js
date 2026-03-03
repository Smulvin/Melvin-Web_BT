let steps = Array.from(document.querySelectorAll('.step'));
const nextBtn = document.getElementById('next-step-button');
const prevBtn = document.getElementById('previous-step-button');
const numberInput = document.getElementById('number-of-beneficiaries-not-charges');
const template = document.getElementById('beneficiary-template');
const beneficiariesContainer = document.getElementById('beneficiaries-container');

let currentStep = 0;

if (steps.length > 0) {
    initSteps();
    showStep(currentStep);
}

function initSteps() {
    steps.forEach((step, index) => {
        if (index !== currentStep) step.classList.add('inactive');
    });
}

function showStep(index) {
    steps.forEach(step => {
        step.classList.add('inactive');
        step.classList.remove('active');
    });

    steps[index].classList.remove('inactive');
    steps[index].classList.add('active');

    if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'block';

    if (nextBtn) {
        if (index === steps.length - 1) {
            nextBtn.type = 'submit';
            nextBtn.textContent = 'Verzenden';
        } else {
            nextBtn.type = 'button';
            nextBtn.textContent = 'Volgende';
        }
    }
}

// Listen for number input changes (optional)
numberInput?.addEventListener('input', (event) => {
    console.log('Number of beneficiaries:', event.target.value);
});

//Voor het duplicaten van de verkrijgers heb ik ChatGPT gebruikt, eerst had ik een andere set-up die niet werkte.
//Dylan gaf aan om een template te gebruiken, nadat ik het nog een keer aan AI vroeg met die extra info werkte het vrijwel meteen

// Generate beneficiary steps dynamically
function generateBeneficiaries(number) {
    // Remove old beneficiary steps from DOM and steps array
    steps = steps.filter(step => !step.classList.contains('beneficiary-step'));
    document.querySelectorAll('.beneficiary-step').forEach(el => el.remove());

    // Reference to step6, after which we insert beneficiaries
    const step6 = document.getElementById('step6');

    for (let i = 0; i < number; i++) {
        const clone = template.content.cloneNode(true);
        const fieldset = clone.querySelector('fieldset');

        // Ensure it keeps 'step' and 'beneficiary-step' classes
        fieldset.classList.add('step', 'beneficiary-step');

        // Update legend
        const legend = fieldset.querySelector('legend');
        if (legend) legend.textContent = `Verkrijger ${i + 1}`;

        // Make unique IDs and names
        fieldset.querySelectorAll('input, fieldset, legend, label').forEach(el => {
            if (el.id) el.id = `${el.id}-${i + 1}`;
            if (el.name) el.name = `${el.name}-${i + 1}`;
        });

        // Insert **after step6** in the DOM
        step6.after(fieldset);

        // Insert **after step6 in steps array** so navigation works correctly
        const indexStep6 = steps.indexOf(step6);
        steps.splice(indexStep6 + 1 + i, 0, fieldset);
    }
}

// Next button click
nextBtn?.addEventListener('click', () => {

    if (steps[currentStep].id === 'step6') {
        const num = parseInt(numberInput.value, 10);
        if (!isNaN(num) && num > 0) {
            generateBeneficiaries(num);
        }
    }

    let nextIndex = currentStep + 1;

    // Skip any skipped steps
    while (
        nextIndex < steps.length &&
        steps[nextIndex].classList.contains("step-skipped")
    ) {
        nextIndex++;
    }

    if (nextIndex < steps.length) {
        currentStep = nextIndex;
        showStep(currentStep);
    }
});

// Previous button click
prevBtn?.addEventListener('click', () => {

    let prevIndex = currentStep - 1;

    // Skip backwards over skipped steps
    while (
        prevIndex >= 0 &&
        steps[prevIndex].classList.contains("step-skipped")
    ) {
        prevIndex--;
    }

    if (prevIndex >= 0) {
        currentStep = prevIndex;
        showStep(currentStep);
    }
});

document.addEventListener("DOMContentLoaded", function () {

    // Configuration: which radio skips which steps
    const skipConfig = {
        "is-executioner": ["step6"],
    };

    document.querySelectorAll('input[name="executioner"]').forEach(radio => {
        radio.addEventListener("change", function () {

            // Remove previous skips
            document.querySelectorAll(".step-skipped").forEach(step => {
                step.classList.remove("step-skipped");
            });

            const stepsToSkip = skipConfig[this.id];

            if (stepsToSkip) {
                stepsToSkip.forEach(stepId => {
                    const step = document.getElementById(stepId);
                    if (step) {
                        step.classList.add("step-skipped");
                    }
                });
            }

        });
    });

});