import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.widgets import Button

def d2r(d):
    return d * np.pi / 180

def rotation(V, theta, sf):
    vxnew = (V[:, 0] * np.cos(theta) - V[:, 1] * np.sin(theta)) * sf
    vynew = (V[:, 0] * np.sin(theta) + V[:, 1] * np.cos(theta)) * sf
    return np.column_stack((vxnew, vynew))

def angle(l1, l2, l3):
    cos_theta = np.clip((l1 ** 2 + l2 ** 2 - l3 ** 2) / (2 * l1 * l2), -1, 1)
    return np.arccos(cos_theta)

def bar(V):
    return np.sqrt(V[:, 0] ** 2 + V[:, 1] ** 2)

def plotter(X, OA, OB, OC, AX, BY, AC, BC, Y, i, line_objects):
    for line in line_objects:
        line.set_data([], [])

    # Update plot data for this frame
    line_objects[0].set_data([0, X[i, 0]], [0, X[i, 1]])  # OX line (blue dotted)
    line_objects[0].set_linestyle('dotted')
    line_objects[0].set_color('blue')
    
    line_objects[1].set_data([0, OA[i, 0]], [0, OA[i, 1]])  # OA line
    line_objects[2].set_data([OA[i, 0], AX[i, 0] + OA[i, 0]], [OA[i, 1], AX[i, 1] + OA[i, 1]])  # AX line
    line_objects[3].set_data([OA[i, 0], AC[i, 0] + OA[i, 0]], [OA[i, 1], AC[i, 1] + OA[i, 1]])  # AC line
    line_objects[4].set_data([OC[i, 0], X[i, 0]], [OC[i, 1], X[i, 1]])  # OC line
    
    line_objects[5].set_data([0, Y[i, 0]], [0, Y[i, 1]])  # OY line (blue dotted)
    line_objects[5].set_linestyle('dotted')
    line_objects[5].set_color('blue')

    line_objects[6].set_data([0, OB[i, 0]], [0, OB[i, 1]])  # OB line
    line_objects[7].set_data([OB[i, 0], BY[i, 0] + OB[i, 0]], [OB[i, 1], BY[i, 1] + OB[i, 1]])  # BY line
    line_objects[8].set_data([OB[i, 0], OC[i, 0]], [OB[i, 1], OC[i, 1]])  # OC line
    line_objects[9].set_data([OC[i, 0], Y[i, 0]], [OC[i, 1], Y[i, 1]])  # Y line

    for line in line_objects[1:]:
        line.set_color('black')
        line.set_linestyle('-')

    return line_objects

# Parameters
alpha = d2r(90)
beta = np.arctan(1.4)
gamma = np.pi - beta - alpha
sf = 1.4
l1 = 5  # max horizontal distance
l2 = 3.5

X = []
x = np.linspace(-1.5, 1.25, 40)
for i in range(len(x)):
    if x[i] < 0:
        X.append([6, x[i]])
    else:
        X.append([6 + x[i], 0])

X = np.array(X)
theta = angle(l1, bar(X), l2 / (np.sin(beta) / np.sin(gamma))) 
Y = rotation(X, alpha, sf) 
OA = rotation(X, theta, l1 / bar(X)) 
psi = angle(bar(X), (l2 * np.sin(gamma) / np.sin(beta)), bar(OA))
AX = -rotation(-X, -psi, (l2 * np.sin(gamma) / np.sin(beta)) / bar(X))
AC = rotation(AX, alpha, l2 / bar(AX))
OC = OA + AC

BC = OA  # parallelogram
OB = AC
BY = rotation(BC, alpha, 1 / (np.sin(gamma) / np.sin(beta)))

# Initialize plot
fig, ax = plt.subplots()
ax.set_xlim(-5, 14)
ax.set_ylim(-5, 14)
ax.set_aspect('equal')

# Create line objects for dynamic plotting
line_objects = [ax.plot([], [], 'b')[0] for _ in range(10)]

# Animation control variables
is_playing = True
current_frame = 0

# Initialize animation
def init():
    for line in line_objects:
        line.set_data([], [])
    return line_objects

# Update function for animation
def update(frame):
    global current_frame
    if is_playing:
        current_frame = (current_frame + 1) % len(X)
    return plotter(X, OA, OB, OC, AX, BY, AC, BC, Y, current_frame, line_objects)

# Create animation
ani = animation.FuncAnimation(fig, update, frames=len(X), init_func=init, interval=100, blit=True, repeat=True)

# Play/Pause Button
def toggle_play(event):
    global is_playing
    is_playing = not is_playing

# Create Play/Pause button
ax_play_pause = plt.axes([0.8, 0.9, 0.1, 0.05])
btn_play_pause = Button(ax_play_pause, 'Play/Pause')
btn_play_pause.on_clicked(toggle_play)

# Show the animation
plt.show()
