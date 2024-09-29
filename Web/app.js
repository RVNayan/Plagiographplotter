let alpha, beta, gamma, sf, l1, l2;
let X = [];
let OA = [], OB = [], OC = [], AX = [], BY = [], AC = [], BC = [], Y = [];
let isPaused = false;  // To track the paused state

function setup() {
    createCanvas(600, 600);
    frameRate(10);  // Set to slower to simulate the frames
    noLoop();  // Start with the loop off

    // Initialize parameters with default values
    setDefaultValues();

    // Generate X values similar to the Python version
    generateXValues();
    calculateAnglesAndVectors();

    // Start drawing the animation
    loop();
}

function draw() {
    background(255);
    translate(width / 2, height / 2);
    scale(20, -20);  // Scaling and inverting Y axis for proper display

    // Draw current frame
    let i = frameCount % X.length;  // Loop through frames
    plotter(X[i], OA[i], OB[i], OC[i], AX[i], BY[i], AC[i], BC[i], Y[i]);
}

function setDefaultValues() {
    alpha = radians(parseFloat(document.getElementById('alpha').value)) || radians(180);
    beta = radians(parseFloat(document.getElementById('beta').value)) || radians(53.13);
    gamma = Math.PI - beta - alpha;
    sf = parseFloat(document.getElementById('sf').value) || 1.4;
    l1 = parseFloat(document.getElementById('l1').value) || 5;
    l2 = parseFloat(document.getElementById('l2').value) || 3.5;
}

function generateXValues() {
    let x_vals = linspace(-2, 2, 40);
    X = x_vals.map(x => (x < 0) ? [6, x] : [6 + x, 0]);
}

function calculateAnglesAndVectors() {
    let theta = X.map(v => angle(l1, bar(v), l2 / (Math.sin(beta) / Math.sin(gamma))));
    Y = X.map(v => rotation(v, alpha, sf));
    OA = X.map((v, i) => rotation(v, theta[i], l1 / bar(v)));
    let psi = X.map((v, i) => angle(bar(v), (l2 * Math.sin(gamma) / Math.sin(beta)), bar(OA[i])));
    AX = X.map((v, i) => rotation(v, -psi[i], (l2 * Math.sin(gamma) / Math.sin(beta)) / bar(v)));
    AC = AX.map(v => rotation(v, alpha, l2 / bar(v)));
    OC = OA.map((v, i) => [v[0] + AC[i][0], v[1] + AC[i][1]]);
    BC = OA.slice();
    OB = AC.slice();
    BY = OA.map(v => rotation(v, alpha, 1 / (Math.sin(gamma) / Math.sin(beta))));
}

// Update Button Functionality
document.getElementById('updateBtn').addEventListener('click', () => {
    setDefaultValues();  // Update parameters based on input fields
    calculateAnglesAndVectors();  // Recalculate angles and vectors after updating parameters
});

// Play/Pause functionality
document.getElementById('playPauseBtn').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('playPauseBtn').textContent = isPaused ? 'Play' : 'Pause';
    if (!isPaused) {
        loop();  // Resume the animation
    } else {
        noLoop();  // Pause the animation
    }
});

// Helper functions
function radians(deg) {
    return deg * Math.PI / 180;
}

function rotation(V, theta, sf) {
    let vxnew = (V[0] * Math.cos(theta) - V[1] * Math.sin(theta)) * sf;
    let vynew = (V[0] * Math.sin(theta) + V[1] * Math.cos(theta)) * sf;
    return [vxnew, vynew];
}

function angle(l1, l2, l3) {
    let cos_theta = Math.min(Math.max((l1 ** 2 + l2 ** 2 - l3 ** 2) / (2 * l1 * l2), -1), 1);
    return Math.acos(cos_theta);
}

function bar(V) {
    return Math.sqrt(V[0] ** 2 + V[1] ** 2);
}

function linspace(start, end, n) {
    let arr = [];
    let step = (end - start) / (n - 1);
    for (let i = 0; i < n; i++) {
        arr.push(start + step * i);
    }
    return arr;
}

function plotter(X, OA, OB, OC, AX, BY, AC, BC, Y) {
    stroke(0);
    strokeWeight(0.05);

    drawingContext.setLineDash([.5, .5])
    stroke('blue');
    line(0, 0, X[0], X[1]);
    line(0, 0, Y[0], Y[1]);
    drawingContext.setLineDash([])

    // Draw red parts
    stroke('red');
    line(0, 0, OA[0], OA[1]);
    line(OA[0], OA[1], OA[0] + AX[0], OA[1] + AX[1]);
    line(OA[0], OA[1], OA[0] + AC[0], OA[1] + AC[1]);
    line(OC[0], OC[1], X[0], X[1]);

    // Draw green parts
    stroke('green');
    line(0, 0, OB[0], OB[1]);
    line(OB[0], OB[1], OB[0] + BY[0], OB[1] + BY[1]);
    line(OB[0], OB[1], OC[0], OC[1]);
    line(OC[0], OC[1], Y[0], Y[1]);

    // Add labels and visual aids as needed
}
