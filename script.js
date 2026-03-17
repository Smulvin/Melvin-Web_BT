let steps = Array.from(
    document.querySelectorAll('.step:not(.fall-back-step):not(.final-screen-step)')
);
const nextBtn = document.getElementById('next-step-button');
// Button is standaard een Submit, zodat zonder javascript hij ook werkt. Wordt meteen button gemaakt in javascript
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

const requiredInputs = document.querySelectorAll('.required');
// elementen met de required attribute krijgen required via javascript, anders zijn ze verplicht zonder als javascript niet werkt
requiredInputs.forEach(input => {
    input.setAttribute('required', '');
});

// Steps volledig inactief maken
document.querySelectorAll('.fall-back-step').forEach(step => {
    step.classList.add('inactive');
});

document.querySelectorAll('.final-screen-step').forEach(step => {
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

    // Update paginator tekst
    const paginator = document.getElementById('paginator');
    if (paginator) {
        paginator.textContent = `Pagina ${index + 1}/${steps.length}`;
    }

    // Accessibility voor toetsenbord controls
    const stepEl = steps[index];
    stepEl.setAttribute('tabindex', '-1');

    const legend = stepEl.querySelector('legend');

    if (legend) {
        legend.setAttribute('tabindex', '-1');
        legend.focus();
    } else {
        stepEl.focus();
    }
}

//Voor het duplicaten van de verkrijgers heb ik ChatGPT gebruikt, eerst had ik een andere setup die niet werkte.
//Dylan gaf aan om een template te gebruiken, nadat ik het nog een keer aan AI vroeg met die extra info werkte het vrijwel meteen

// Generate beneficiary steps dynamically
function generateBeneficiaries(number) {
    // Remove old beneficiary steps from DOM and steps array
    steps = steps.filter(step => !step.classList.contains('beneficiary-step'));
    document.querySelectorAll('.beneficiary-step').forEach(el => el.remove());

    const step6 = document.getElementById('step6');

    for (let i = 0; i < number; i++) {
        const clone = template.content.cloneNode(true);
        const fieldset = clone.querySelector('fieldset');

        // Elke toegevoegde stap de juiste classes geven
        fieldset.classList.add('step', 'beneficiary-step');

        // Update legend
        const legend = fieldset.querySelector('legend');
        if (legend) legend.textContent = `Verkrijger ${i + 1}`;

        // Unieke ids en namen geven
        fieldset.querySelectorAll('input, fieldset, legend, label').forEach(el => {
            if (el.id) el.id = `${el.id}-${i + 1}`;
            if (el.name) el.name = `${el.name}-${i + 1}`;
        });

        // Extra verkrijgers toeveogen na stap 6 in de DOM
        step6.after(fieldset);

        // In de array ook na stap 6 toeveogen zodat navigatie correct blijft werken
        const indexStep6 = steps.indexOf(step6);
        steps.splice(indexStep6 + 1 + i, 0, fieldset);
    }
}

// Volgende button
nextBtn?.addEventListener('click', () => {
    const currentStepEl = steps[currentStep];

    // Only visible & enabled inputs
    const inputs = Array.from(currentStepEl.querySelectorAll('input, select, textarea'))
        .filter(input => !input.disabled && input.offsetParent !== null);

    let firstInvalid = null;

    for (const input of inputs) {
        if (!input.checkValidity()) {
            firstInvalid = input;
            break; //Stop bij de eerste invalid
        }
    }

    // Valideren op elke stap
    // if (firstInvalid) {
    //     firstInvalid.reportValidity();
    //     return; // Zorgt voor dat je niet naar volgende stap kan
    // }

    // Dynamisch gerereren van verkrijgers
    if (currentStepEl.id === 'step6') {
        const num = parseInt(numberInput.value, 10);
        if (!isNaN(num) && num > 0) {
            generateBeneficiaries(num);
        }
    }

    // Naar volgende stap gaan, geskipte stappen overslaan
    let nextIndex = currentStep + 1;
    while (nextIndex < steps.length && steps[nextIndex].classList.contains("step-skipped")) {
        nextIndex++;
    }

    if (nextIndex < steps.length) {
        currentStep = nextIndex;
        showStep(currentStep);
    } else {
        // Laatste scherm laten zien 
        const finalScreen = document.querySelector('.final-screen-step');

        steps.forEach(step => {
            step.classList.add('inactive');
            step.classList.remove('active');
        });

        if (finalScreen) {
            finalScreen.classList.remove('inactive');
            finalScreen.classList.add('active');
        }

        if (nextBtn) nextBtn.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
    }
});

// Vorige button 
prevBtn?.addEventListener('click', () => {

    let prevIndex = currentStep - 1;

    // Wanneer terug door het formulier gaan, worden geskipte stappen ook overgeslagen
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


// Bepaalde stappen skippen of overslaan bij bepaalde radio buttons
document.addEventListener("change", function (e) {
    const radio = e.target;

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
        // Make inaccessible for assistive tech
        target.setAttribute("aria-hidden", "true");
        target.inert = true;

        // Disable all child inputs
        inputs.forEach(input => input.disabled = true);
    }

    if (radio.value === "yes") {
        // Make accessible
        target.removeAttribute("aria-hidden");
        target.inert = false;
        // Enable all child inputs
        inputs.forEach(input => input.disabled = false);
    }
});
// Date validatie
const today = new Date().toISOString().split("T")[0];

document.querySelectorAll('input[type="date"]').forEach(input => {
    input.max = today;
});