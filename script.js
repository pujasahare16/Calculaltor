class Calculator {
    constructor() {
        this.displayElement = document.getElementById('display');
        this.historyElement = document.getElementById('history');
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.initializeEventListeners();
        this.animateOnLoad();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.dataset.number);
                this.animateButton(button);
            });
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.dataset.operator);
                this.animateButton(button);
                this.highlightOperator(button);
            });
        });

        // Action buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                this.handleAction(button.dataset.action);
                this.animateButton(button);
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    animateOnLoad() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach((button, index) => {
            button.style.animation = `fadeInUp 0.5s ease ${index * 0.02}s backwards`;
        });
    }

    animateButton(button) {
        button.style.animation = 'none';
        setTimeout(() => {
            button.style.animation = '';
        }, 10);
    }

    highlightOperator(button) {
        // Remove active class from all operators
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
        // Add active class to clicked operator
        button.classList.add('active');
    }

    appendNumber(number) {
        // Prevent multiple decimal points
        if (number === '.' && this.currentValue.includes('.')) return;
        
        if (this.shouldResetDisplay) {
            this.currentValue = number === '.' ? '0.' : number;
            this.shouldResetDisplay = false;
        } else {
            this.currentValue = this.currentValue === '0' && number !== '.' 
                ? number 
                : this.currentValue + number;
        }
        
        this.updateDisplay();
        this.flashDisplay();
    }

    chooseOperation(operator) {
        if (this.currentValue === '') return;
        
        if (this.previousValue !== '') {
            this.calculate();
        }
        
        this.operation = operator;
        this.previousValue = this.currentValue;
        this.updateHistory();
        this.shouldResetDisplay = true;
    }

    calculate() {
        let result;
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        // Format result to avoid floating point issues
        result = Math.round(result * 100000000) / 100000000;
        
        this.currentValue = result.toString();
        this.operation = null;
        this.previousValue = '';
        this.updateDisplay();
        this.updateHistory();
        this.clearOperatorHighlight();
        this.celebrateCalculation();
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'percent':
                this.percentage();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
        this.updateHistory();
        this.clearOperatorHighlight();
        this.animateClear();
    }

    delete() {
        if (this.currentValue.length === 1) {
            this.currentValue = '0';
        } else {
            this.currentValue = this.currentValue.slice(0, -1);
        }
        this.updateDisplay();
    }

    percentage() {
        const current = parseFloat(this.currentValue);
        if (isNaN(current)) return;
        this.currentValue = (current / 100).toString();
        this.updateDisplay();
    }

    updateDisplay() {
        // Limit display length
        let displayValue = this.currentValue;
        if (displayValue.length > 12) {
            displayValue = parseFloat(displayValue).toExponential(6);
        }
        this.displayElement.textContent = displayValue;
    }

    updateHistory() {
        if (this.previousValue && this.operation) {
            this.historyElement.textContent = `${this.previousValue} ${this.operation}`;
        } else {
            this.historyElement.textContent = '';
        }
    }

    flashDisplay() {
        const container = document.querySelector('.display-container');
        container.classList.remove('flash');
        void container.offsetWidth; // Trigger reflow
        container.classList.add('flash');
    }

    showError() {
        this.displayElement.textContent = 'Error';
        this.displayElement.classList.add('error');
        setTimeout(() => {
            this.displayElement.classList.remove('error');
            this.clear();
        }, 1500);
    }

    clearOperatorHighlight() {
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    animateClear() {
        const container = document.querySelector('.display-container');
        container.style.animation = 'none';
        setTimeout(() => {
            container.style.animation = 'fadeInUp 0.3s ease';
        }, 10);
    }

    celebrateCalculation() {
        const equalsBtn = document.querySelector('[data-action="equals"]');
        equalsBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            equalsBtn.style.transform = '';
        }, 200);
    }

    handleKeyboard(e) {
        // Numbers and decimal
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
            this.appendNumber(e.key);
            this.highlightKey(e.key);
        }
        
        // Operators
        if (['+', '-', '*', '/'].includes(e.key)) {
            this.chooseOperation(e.key);
            this.highlightKey(e.key);
        }
        
        // Actions
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.calculate();
            this.highlightKey('=');
        }
        
        if (e.key === 'Backspace') {
            this.delete();
        }
        
        if (e.key === 'Escape') {
            this.clear();
        }
        
        if (e.key === '%') {
            this.percentage();
        }
    }

    highlightKey(key) {
        let selector;
        
        if (key >= '0' && key <= '9' || key === '.') {
            selector = `[data-number="${key}"]`;
        } else if (['+', '-', '*', '/'].includes(key)) {
            selector = `[data-operator="${key}"]`;
        } else if (key === '=') {
            selector = '[data-action="equals"]';
        }
        
        if (selector) {
            const button = document.querySelector(selector);
            if (button) {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 100);
            }
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
    
    // Add extra interactivity to header dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
});
