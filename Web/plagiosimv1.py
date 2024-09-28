import numpy as np
import matplotlib.pyplot as pt
import cv2
import os


def d2r(d):
    return d * np.pi / 180

def rotation(V,theta,sf):
    vxnew = (V[:,0] * np.cos(theta) - V[:,1] * np.sin(theta)) * sf
    vynew = (V[:,0] * np.sin(theta) + V[:,1] * np.cos(theta)) * sf
    
    Vnew = []
    for i in range(len(V)):
        Vnew.append([vxnew[i], vynew[i]])
    Vnew = np.array(Vnew)
    
    return Vnew

def angle(l1,l2,l3):
    cos_theta = np.clip((l1 ** 2 + l2 ** 2 - l3 ** 2) / (2 * l1 * l2), -1, 1)
    return np.arccos(cos_theta)


def bar(V):
    dist = (V[:,0] ** 2 + V[:,1] ** 2) ** 0.5
    return dist

def dist(Y):
    return (Y[0] ** 2 + Y[1] ** 2) ** 0.5


def plotter(X, OA, OB, OC, AX, BY, AC, BC, Y,i):
    pt.rcParams['figure.figsize'] = [6,6]

    pt.plot([0,X[i,0]],[0,X[i,1]],c='blue',linestyle='dashed')
    pt.plot([0,OA[i,0]],[0,OA[i,1]], c= 'red')
    pt.plot([OA[i,0],AX[i,0] + OA[i,0]],[OA[i,1],AX[i,1] + OA[i,1]],c='red')
    pt.plot([OA[i,0],AC[i,0] + OA[i,0]],[OA[i,1],AC[i,1] + OA[i,1]],c='red')
    pt.plot([OC[i,0],X[i,0]], [OC[i,1],X[i,1]],c='red')


    pt.plot([0,Y[i,0]],[0,Y[i,1]],c='blue',linestyle='dashed')
#     pt.text((0+Y[i,0]) / 2, (0+Y[i,1]) / 2, dist(AX[i]), fontsize=12, color='black', ha='center', va='top')
    pt.plot([0,OB[i,0]],[0,OB[i,1]],c='green') #bug2 MAIN ERROR
    pt.plot([OB[i,0],BY[i,0] + OB[i,0]],[OB[i,1], BY[i,1] + OB[i,1]],c='green') #bug 4
    pt.plot([OB[i,0],OC[i,0]],[OB[i,1],OC[i,1]],c='green') #bug 3
    pt.plot([OC[i,0],Y[i,0]], [OC[i,1],Y[i,1]],c='green')

    pt.plot(X[:, 0], X[:, 1], c = 'black')
    # pt.plot(Ye[:, 0], Ye[:, 1], c = 'black',label='Theory')
    pt.plot(Y[:, 0], Y[:, 1], c = 'black',linestyle='dashed',label='Experimental')
    pt.xlim(-5,14)
    pt.ylim(-5,14)
    pt.legend()
    pt.savefig(f'images/frame_{i:04d}.png')
    pt.close()
    
    
    
    
    
#Test
#params

alpha = d2r(90)
beta = np.arctan(1.4)
gamma = np.pi - beta - alpha
sf = 1.4
l1 = 5 #max horizontal distance
l2 = 3.5

X = []
x = np.linspace(-1.5,1.25,40)
for i in range(len(x)):
    if x[i] < 0:
        X.append([6,x[i]])
    else:
        X.append([6 + x[i],0])

X = np.array(X)
theta = angle(l1 ,bar(X) ,l2 / (np.sin(beta) / np.sin(gamma))) 
Y = rotation(X, alpha, sf) # bug 3
OA = rotation(X, theta, l1 / bar(X)) #Marking OA
psi = angle(bar(X),(l2 * np.sin(gamma) / np.sin(beta)),bar(OA))
AX = -rotation(-X, -psi, (l2 * np.sin(gamma) / np.sin(beta)) / bar(X))
AC = rotation(AX, alpha, l2 / bar(AX))
XC = AC - AX #bug1 
OC = OA + AC

BC = OA #parallelogram
OB = AC
BY = rotation(BC,alpha,1 /(np.sin(gamma) / np.sin(beta)))
bar(Y),X
for i in range(len(X)):
    plotter(X, OA, OB, OC, AX, BY, AC, BC, Y,i)



if not os.path.exists('images'):
    os.makedirs('images')

# Initialize VideoWriter
frame_height, frame_width = 480, 640  # Adjust based on your frame size
video_path = 'video/output_video.mp4'  # Output video file path
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Define codec for video file
fps = 10  # Frames per second
out = cv2.VideoWriter(video_path, fourcc, fps, (frame_width, frame_height))

for t2 in range(len(X)):
    frame_path = f'images/frame_{t2:04d}.png'
    
    if os.path.exists(frame_path):
        frame = cv2.imread(frame_path)
        if frame is None:
            print(f"Error: Unable to read {frame_path}")
        else:
            frame = cv2.resize(frame, (frame_width, frame_height))  # Ensure frame size matches video size
            out.write(frame)  # Write frame to video
            if t2 % 10 == 0:
                print(f'Completed adding {frame_path}')
    else:
        print(f"File {frame_path} does not exist")

# Release the video writer
out.release()

print()
print('Process completed. New video added to the folder /video')


for t2 in range(len(X)):
    file_path = f'images/frame_{t2:04d}.png'
    if os.path.exists(file_path):
        os.remove(file_path)