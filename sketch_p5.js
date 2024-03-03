const noiseScale = 1000
const noiseStrength = 1.1

const maxCanvasSize = 600
let canvasSize = window.innerWidth < maxCanvasSize ? window.innerWidth : maxCanvasSize
let globalScale = canvasSize/maxCanvasSize

const palette = {
  greens: [
    [57, 28, 63],
    [59, 45, 60],
    [64, 36, 43],
    [85, 15, 37]
  ],
  oranges: [
    [40, 74, 86],
    [37, 76, 89],
    [24, 69, 89],
    [17, 43, 91],
    [14, 45, 90],
    [210, 63, 95]
  ],
  sky: [
    [209, 36, 27], // dark night
    [30, 10, 94] // pale yellow
  ]
}

window.onresize = () => {
  canvasSize = window.innerWidth < maxCanvasSize ? window.innerWidth : maxCanvasSize
  globalScale = canvasSize / maxCanvasSize
  resizeCanvas(canvasSize, canvasSize)
}


function setup() {
  pixelDensity(maxCanvasSize/canvasSize * 2)
  const canvasEl = document.querySelector('#main-canvas')
  canvasEl.onclick = () => {
    console.log(displayDensity())
    clear()
    redraw()
  }

  document.querySelector('#btn-save-canvas').onclick = () => {
    saveCanvas()
  }

  createCanvas(canvasSize, canvasSize, canvasEl);
  noLoop()
  angleMode(DEGREES)
  colorMode(HSB, 360, 100, 100, 1)
  noiseDetail(3, 0.5)
}

function draw() {
  let skyColorIndex = floor(random(0, palette.sky.length))
  let backgroundClr = palette.sky[skyColorIndex]
  
  background(backgroundClr)
  
  push()
    filter(BLUR, 1.8)
    for(let i = 0; i < floor(random(6, 10)); i++) {
        let rand_x = random(0, canvasSize)
        noStroke()
        fill(backgroundClr[0], backgroundClr[1], backgroundClr[2] + 10)
        ellipse(rand_x, canvasSize, random(30, 400) * globalScale)
      }
  pop()
  
  let alphaVal = 0.2
  let randomGrowthOffset = random(6,8)
  let nowMillis = millis()
  
  push()
    for (let r = 0; r < 3; r++) {
      alphaVal += 1/4 * r
      filter(BLUR, 0.5 * (3-r))
      for(let i = 0; i < random(15, 30); i++) {
        let loc_x =  i * random(10, 80) + random(0, 100)
        let loc_y = canvasSize + 10

        plant(loc_x, loc_y, random(), alphaVal, nowMillis)
      }
    }
  pop()
  
  let isSnowing = skyColorIndex < 1 && random() < 0.4
  
  if (!isSnowing) {
    
  }
  else {
    for (let i = 0; i < 200; i++) {
      let rand_x = random(0, canvasSize)
      let rand_y = random(0, canvasSize)
      stroke(0,0,100, random(0.2, 1))
      fill(0,0,100, random(0.2, 1))
      ellipse(rand_x, rand_y, random(0,1.5))
    }
  }
  

}

// function mouseClicked() {
//   clear()
//   redraw()
// }

function petal(x, y, rot = 0, alphaVal = 1, petalColor = []) {
  push()
    translate(x, y)
    rotate(rot)
    fill(petalColor[0] + random(-10, 10), petalColor[1] + random(-10, 10), petalColor[2], alphaVal)
    stroke(petalColor[0], petalColor[1], 60, alphaVal)
    // noStroke()
    beginShape()
      vertex(0, 0)
      bezierVertex(random(-18, -15), 0, random(-10, -5), -50, 0, -50)
      bezierVertex(random(5, 10), -50, random(15, 18), 0, 0, 0)
    endShape()
  pop()
}

function flowerBud(x,y,rot = 0, alphaVal = 1){
  let petalColor = palette.oranges[floor(random(0, palette.oranges.length))]
  push()
    translate(x, y)
    rotate(rot)
    scale(random(0.5, 0.7) * globalScale)
    petal(8, 0, -6, alphaVal, petalColor)
    petal(-8, 0, 4, alphaVal, petalColor)
    petal(0, 0, 0, alphaVal, petalColor)
  pop()
}

function flower(x,y,rot = 0, alphaVal = 1) {
  let petalColor = palette.oranges[floor(random(0, palette.oranges.length))]
  push()
    translate(x,y)
    rotate(rot)
    scale(random(0.4, 0.6) * globalScale)
    petal(5, -5, 80, alphaVal, petalColor)
    petal(5, -3, 50, alphaVal, petalColor)
    petal(5, 0, 20, alphaVal, petalColor)
    petal(-5, -5, -80, alphaVal, petalColor)
    petal(-5, -3, -50, alphaVal, petalColor)
    petal(-5, 0, -20, alphaVal, petalColor)
    petal(0, 0, 0, alphaVal, petalColor)
  pop()
}

function plant(x, y, randVal, alphaVal, nowMillis) {
  let stalkColor = palette.greens[floor(random(0, palette.greens.length))]
  
  let dwarfRange = random(5,25) * globalScale
  let giantRange = random(40, 45) * globalScale
  
  let length = randVal < 0.3 ? giantRange : dwarfRange
  
  push()
    noFill()
    strokeWeight(2)
    stroke(stalkColor[0], stalkColor[1], stalkColor[2], alphaVal)
    let loc = createVector(x,y)  
    let growAngle = 0
    let growLoc = createVector(0,0)
    
    let locs = []
  
    beginShape()
      curveVertex(loc.x, loc.y)
  
      for(let i = 0; i < length; i++) {
        let angle =
          noise(
            loc.x / noiseScale,
            loc.y / noiseScale,
            frameCount * millis() / noiseScale
          ) *
          -180 *
          noiseStrength; //0-2PI
        
        let dir = createVector(0, 0)
        
        dir.x = cos(angle);
        dir.y = sin(angle);

        var vel = dir.copy();
        if(i >= length-2) {
          vel.mult(0)
        }
        else {
          vel.mult(10);
        }

        loc.add(vel);
        
        curveVertex(loc.x, loc.y)
        
        if(i >= length-1) {
          finalAngle = angle
          growLoc = createVector(loc.x, loc.y)
          break
        }
      }
    endShape()
        
    let rand = random()
    if(rand > 0.8) {
      flower(growLoc.x, growLoc.y, finalAngle+90, alphaVal)
    } else {
      flowerBud(growLoc.x, growLoc.y, finalAngle+90, alphaVal)
    }
    
  pop()
        
  
}