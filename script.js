let steps = Array.from(document.querySelectorAll('.step'))
    //Fallback steps weghalen wanneer javascript correct laad
    .filter(step => !step.classList.contains('fall-back-step'));
const nextBtn = document.getElementById('next-step-button');
if (nextBtn) {
    nextBtn.type = "button";
    nextBtn.textContent = "Volgende";
}
const prevBtn = document.getElementById('previous-step-button');
if (prevBtn) {
    prevBtn.classList.add('previousBtn-active');
}
const numberInput = document.getElementById('number-of-beneficiaries-not-charges');
const template = document.getElementById('beneficiary-template');
const beneficiariesContainer = document.getElementById('beneficiaries-container');

const requiredInputs = document.querySelectorAll('.required');
requiredInputs.forEach(input => {
    input.setAttribute('required', '');
});

// Steps volledig inactief maken
document.querySelectorAll('.fall-back-step').forEach(step => {
    step.classList.add('inactive');
});

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
    const currentStepEl = steps[currentStep];

    // Only visible & enabled inputs
    const inputs = Array.from(currentStepEl.querySelectorAll('input, select, textarea'))
        .filter(input => !input.disabled && input.offsetParent !== null);

    let firstInvalid = null;

    for (const input of inputs) {
        if (!input.checkValidity()) {
            firstInvalid = input;
            break; // stop at the first invalid input
        }
    }

    // Check validity per step
    if (firstInvalid) {
        firstInvalid.reportValidity();
        return; // Prevent going to next step
    }

    // Generate beneficiaries dynamically if on step6
    if (currentStepEl.id === 'step6') {
        const num = parseInt(numberInput.value, 10);
        if (!isNaN(num) && num > 0) {
            generateBeneficiaries(num);
        }
    }

    // Move to next step (skip skipped steps)
    let nextIndex = currentStep + 1;
    while (nextIndex < steps.length && steps[nextIndex].classList.contains("step-skipped")) {
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

// Skippen van specifieke steps
document.addEventListener("DOMContentLoaded", function () {

    // Welke radio waarde skipt welke steps
    const skipConfig = {
        "is-executioner": ["step6"],
        "is-heir-multiple": ["step8"],
        "is-heir-single": ["step8"]
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


// Voor screenreaders moest er een display none
document.addEventListener("change", function(e) {
    const radio = e.target;

    if (!radio.matches('input[type="radio"]')) return;

    const step = radio.closest(".step");
    if (!step) return;

    const groups = {
        "married": ".married-dependent-fields",
        "marriage-recorded": ".marriage-recorded-dependent-fields",
        "had-children": ".children-dependent-fields",
        "child-deceased": ".deceased-child-dependent-fields",
        "had-will": ".will-dependent-fields",
        "are-beneficiaries": ".show-number-of-beneficiaries"
    };

    const selector = groups[radio.name];
    if (!selector) return;

    const target = step.querySelector(selector);
    if (!target) return;

    // Select all form controls inside target
    const inputs = target.querySelectorAll("input, select, textarea, button");

    if (radio.value === "no") {
        target.setAttribute("aria-hidden", "true");
        target.setAttribute("inert", "");

        // Disable all children inputs
        inputs.forEach(input => input.disabled = true);
    }

    if (radio.value === "yes") {
        target.removeAttribute("aria-hidden");
        target.removeAttribute("inert");

        // Enable all children inputs
        inputs.forEach(input => input.disabled = false);
    }
});