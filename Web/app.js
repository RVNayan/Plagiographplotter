let alpha, beta, gamma, sf, l1, l2;
let X = [];
let OA = [], OB = [], OC = [], AX = [], BY = [], AC = [], BC = [], Y = [];
let scaler = 20;
let drawing = false;
let linePoints = [];
let yPathPoints = []; // Array to store the path traced by Y
const BREAK_POINT = null;

function setup() {
    createCanvas(600, 600);

    setDefaultValues();

    generateXValues();
    calculateAnglesAndVectors();

    document.getElementById('updateBtn').addEventListener('click', () => {
        updateValues();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        linePoints = []; // Clear all drawn lines
        yPathPoints = []; // Clear Y’s path as well
    });

    document.getElementById('Hidetext').addEventListener('click', () => {
        showSigns = !showSigns;  // Toggle the value of showSigns
    });
    

    const existingCanvas = select('canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }

    // Now create a new canvas and attach it to the .canvas-container
    canvas = createCanvas(600, 600);
    canvas.parent(document.querySelector('.canvas-container'));  // Attach to the canvas container

    background(200);
}

let showSigns = true;  // Set to true to show nomenclature, false to hide it

function draw() {
    background(255);
    translate(width / 2, height / 2);
    scale(scaler, -scaler);

    generateXValues();
    calculateAnglesAndVectors();

    plotter(X, OA, OB, OC, AX, BY, AC, BC, Y);

    // Draw the traced path of X
    drawPath(linePoints, color('lightblue'));

    // Draw the traced path of Y
    drawPath(yPathPoints, color('black'));

    // Draw labels if showSigns is true
    if (showSigns) {
        drawLabels();
    }
}

// Function to draw the labels for nodes and angles
function drawLabels() {
    // Labels for nodes A, B, C, X, Y
    fill(0);
    textSize(0.8);
    textAlign(BOTTOM, BOTTOM);

    // X, Y labels
    text("X", X[0], X[1]);
    text("0", 0,0);
    text("Y", OB[0] + BY[0], OB[1] + BY[1]);

    // OA, OB, and OC positions for A, B, C
    text("A", OA[0], OA[1]);
    text("B", OB[0], OB[1]);
    text("C", OC[0], OC[1]);

}


// Function to draw a path with an optional offset
function drawPath(points, strokeColor) {
    stroke(strokeColor);
    strokeWeight(0.1);
    noFill();

    beginShape();
    for (let pt of points) {
        if (pt === BREAK_POINT) {
            endShape();
            beginShape();
        } else {
            vertex(pt.x, pt.y);
        }
    }
    endShape();
}

function mousePressed() {
    if (mouseButton === LEFT) {
        drawing = true;
        linePoints.push(BREAK_POINT); // Add a break to start a new line segment for X
        yPathPoints.push(BREAK_POINT); // Also start a new segment for Y
    }
}

function mouseReleased() {
    if (mouseButton === LEFT) {
        drawing = false;
    }
}

function generateXValues() {
    // Check if the mouse is inside the canvas
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let k = height / scaler;
        let x_val = (mouseX / height - 0.5) * k;
        let y_val = (0.5 - mouseY / width) * k;
        X = [x_val, y_val];

        if (drawing) {
            linePoints.push(createVector(x_val, y_val)); // Store points while drawing for X
            yPathPoints.push(createVector(OB[0] + BY[0], OB[1] + BY[1])); // Store points while drawing for Y
        }
    }
}

// Updated calculateAnglesAndVectors to compute Y correctly
function calculateAnglesAndVectors() {
    let v = X; // Assuming X is [x_val, y_val]

    let theta = angle(l1, bar(v), l2 / (Math.sin(beta) / Math.sin(gamma)));

    // Calculate Y based on the rotation of vector v by alpha
    Y = rotation(v, alpha, sf);
    let psi = angle(bar(v), (l2 * Math.sin(gamma) / Math.sin(beta)), bar(OA));

    OA = rotation(v, theta, l1 / bar(v));   // Constant
    AX = rotation(v, -psi, (l2 * Math.sin(gamma) / Math.sin(beta)) / bar(v));   // Constant
    BC = OA.slice(); // constant
    BY = rotation(OA, alpha, 1 / (Math.sin(gamma) / Math.sin(beta))); // constant

    AC = rotation(AX, alpha, sf); // changed to sf to keep the edges constant, change to l2 / bar(v) to make it dynamic

    OC = [OA[0] + AC[0], OA[1] + AC[1]];    // Constant
    OB = AC.slice(); // Constant
    
    T = X;
    console.log(T[0]**2 + T[1]**2);
}

// Rest of your helper functions (rotation, angle, bar, etc.) stay the same



// Set default parameter values
function setDefaultValues() {
    alpha = radians(parseFloat(document.getElementById('alpha').value));
    beta = radians(parseFloat(document.getElementById('beta').value));
    sf = parseFloat(document.getElementById('sf').value);
    l1 = parseFloat(document.getElementById('l1').value);
    l2 = parseFloat(document.getElementById('l2').value);
    gamma = Math.PI - beta - alpha;
}

// Update values based on the HTML inputs
function updateValues() {
    setDefaultValues();  // Re-fetch values from inputs
    calculateAnglesAndVectors(); // Recalculate geometry
}


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

function plotter(X, OA, OB, OC, AX, BY, AC, BC, Y) {
    stroke(0);
    strokeWeight(0.05);

    drawingContext.setLineDash([.5, .5])
    stroke('blue');
    line(0, 0, X[0], X[1]);
    line(0, 0, OB[0] + BY[0], OB[1] + BY[1]);
    drawingContext.setLineDash([])

    // Draw red parts
    stroke('red');
    line(0, 0, OA[0], OA[1]);
    line(OA[0], OA[1], OA[0] + AX[0], OA[1] + AX[1]);
    line(OA[0], OA[1], OA[0] + AC[0], OA[1] + AC[1]);
    line(OC[0], OC[1], OA[0] + AX[0], OA[1] + AX[1]);

    // Draw green parts
    stroke('green');
    line(0, 0, OB[0], OB[1]);
    line(OB[0], OB[1], OB[0] + BY[0], OB[1] + BY[1]);
    line(OB[0], OB[1], OC[0], OC[1]);
    line(OC[0], OC[1], OB[0] + BY[0], OB[1] + BY[1]);
}
