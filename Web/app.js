let alpha, beta, gamma, sf, l1, l2;
let X = [];
let OA = [], OB = [], OC = [], AX = [], BY = [], AC = [], BC = [], Y = [];
let scaler = 20;
let drawing = false;
let linePoints = [];
let yPathPoints = [];
const BREAK_POINT = null;
let showUserCurves = true;
let hints = [];
let hintIndex = 0;
let showSigns = true;

// Adjust the number of points stored for paths
const MAX_POINTS = 500; 

function preload() {
    loadStrings('tex/hints.txt', (data) => {
        hints = data;  
        updateHint();
    });
}

function setup() {
    // Adjust canvas size for mobile
    const canvasSize = min(windowWidth * 0.9, windowHeight * 0.7);
    const canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent(document.querySelector('.canvas-container'));

    setDefaultValues();

    generateXValues();
    calculateAnglesAndVectors();

    frameRate(30); // Reduce frame rate for better mobile performance

    document.getElementById('updateBtn').addEventListener('click', updateValues);
    document.getElementById('resetBtn').addEventListener('click', resetCanvas);
    document.getElementById('Hidetext').addEventListener('click', () => showSigns = !showSigns);
    document.getElementById('Dwgtoggle').addEventListener('click', () => showUserCurves = !showUserCurves);

    background(200);
}

function draw() {
    background(255);
    translate(width / 2, height / 2);
    scale(scaler, -scaler);

    generateXValues();
    calculateAnglesAndVectors();

    if (showUserCurves) {
        plotter(X, OA, OB, OC, AX, BY, AC, BC, Y);
    }

    if (showUserCurves) {
        drawPath(linePoints, color('lightblue'));
    }

    drawPath(yPathPoints, color('black'));

    if (showSigns) {
        drawLabels();
    }
}

function mousePressed() {
    if (mouseButton === LEFT) {
        drawing = true;
        linePoints.push(BREAK_POINT);
        yPathPoints.push(BREAK_POINT);
    }
}

function mouseReleased() {
    if (mouseButton === LEFT) {
        drawing = false;
    }
}

function touchStarted() {
    drawing = true;
    linePoints.push(BREAK_POINT);
    yPathPoints.push(BREAK_POINT);
    return false;
}

function touchEnded() {
    drawing = false;
    return false;
}

function generateXValues() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let k = height / scaler;
        let x_val = (mouseX / height - 0.5) * k;
        let y_val = (0.5 - mouseY / width) * k;
        X = [x_val, y_val];

        if (drawing) {
            linePoints.push(createVector(x_val, y_val));
            yPathPoints.push(createVector(OB[0] + BY[0], OB[1] + BY[1]));

            // Limit points stored to optimize performance
            if (linePoints.length > MAX_POINTS) linePoints.shift();
            if (yPathPoints.length > MAX_POINTS) yPathPoints.shift();
        }
    }
}

function resetCanvas() {
    linePoints = [];
    yPathPoints = [];
}

function updateHint() {
    const randomIndex = Math.floor(Math.random() * hints.length);
    const hintContainer = document.getElementById('hint-container');
    hintContainer.innerText = hints[randomIndex];
}

function drawLabels() {
    fill(0);
    textSize(0.8);
    textAlign(BOTTOM, BOTTOM);

    text("X", X[0], X[1]);
    text("0", 0, 0);
    text("Y", OB[0] + BY[0], OB[1] + BY[1]);
    text("A", OA[0], OA[1]);
    text("B", OB[0], OB[1]);
    text("C", OC[0], OC[1]);
}

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
        linePoints.push(BREAK_POINT);
        yPathPoints.push(BREAK_POINT);
    }
}

function mouseReleased() {
    if (mouseButton === LEFT) {
        drawing = false;
    }
}

function generateXValues() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let k = height / scaler;
        let x_val = (mouseX / height - 0.5) * k;
        let y_val = (0.5 - mouseY / width) * k;
        X = [x_val, y_val];

        if (drawing) {
            linePoints.push(createVector(x_val, y_val)); 
            yPathPoints.push(createVector(OB[0] + BY[0], OB[1] + BY[1]));
        }
    }
}

function calculateAnglesAndVectors() {
    let v = X; 
    let theta = angle(l1, bar(v), l2 / (Math.sin(beta) / Math.sin(gamma)));

    Y = rotation(v, alpha, sf);
    let psi = angle(bar(v), (l2 * Math.sin(gamma) / Math.sin(beta)), bar(OA));

    OA = rotation(v, theta, l1 / bar(v));   
    AX = rotation(v, -psi, (l2 * Math.sin(gamma) / Math.sin(beta)) / bar(v));   
    BC = OA.slice();
    BY = rotation(OA, alpha, 1 / (Math.sin(gamma) / Math.sin(beta))); 
    AC = rotation(AX, alpha, sf); 
    OC = [OA[0] + AC[0], OA[1] + AC[1]];    
    OB = AC.slice();
}

function setDefaultValues() {
    alpha = radians(parseFloat(document.getElementById('alpha').value));
    beta = radians(parseFloat(document.getElementById('beta').value));
    sf = parseFloat(document.getElementById('sf').value);
    l1 = parseFloat(document.getElementById('l1').value);
    l2 = parseFloat(document.getElementById('l2').value);
    gamma = Math.PI - beta - alpha;
}

function updateValues() {
    setDefaultValues();  
    calculateAnglesAndVectors(); 
}

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

    stroke('red');
    line(0, 0, OA[0], OA[1]);
    line(OA[0], OA[1], OA[0] + AX[0], OA[1] + AX[1]);
    line(OA[0], OA[1], OA[0] + AC[0], OA[1] + AC[1]);
    line(OC[0], OC[1], OA[0] + AX[0], OA[1] + AX[1]);

    stroke('green');
    line(0, 0, OB[0], OB[1]);
    line(OB[0], OB[1], OB[0] + BY[0], OB[1] + BY[1]);
    line(OB[0], OB[1], OC[0], OC[1]);
    line(OC[0], OC[1], OB[0] + BY[0], OB[1] + BY[1]);

    // Shading
    fill('rgba(20, 74, 221, 0.5)'); // Red with 50% opacity
    noStroke(); // Disable stroke for the filled shape
    beginShape();
    vertex(OB[0], OB[1]);             // B
    vertex(OC[0], OC[1]);             // C
    vertex(OB[0] + BY[0], OB[1] + BY[1]); // Y
    endShape(CLOSE); // Close the shape to form a triangle

    fill('rgba(255, 0, 0, 0.66)'); // Red with 50% opacity
    noStroke(); // Disable stroke for the filled shape
    beginShape();
    vertex(OA[0], OA[1]);             // B
    vertex(OC[0], OC[1]);             // C
    vertex(OA[0] + AX[0], OA[1] + AX[1]); // Y
    endShape(CLOSE); // Close the shape to form a triangle

}
