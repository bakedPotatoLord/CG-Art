
type vec2 = [number, number]
type vec4 = [number, number, number, number]


export interface workerResponse {
  completed: boolean
  message: string;
  data?: ImageData
}


function clamp(val: number, min: number, max: number) {
  return (val > max) ? max : (val < min) ? min : val
}
function mutate(num: number, rand: number, min = -Infinity, max = Infinity) {
  return clamp(num + Math.floor((Math.random() - 0.5) * rand * 2), min, max)
}



function vectorAvg(vec: vec4[]) {
  return <vec4>vec.slice(1)
    .reduce(([a1, a2, a3, a4], [b1, b2, b3, b4]) => [a1 + b1, a2 + b2, a3 + b3, a4 + b4], vec[0])
    .map(val => val / vec.length)
}
function shuffle(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5)
}

//end functions /// -------------------------- ///

onmessage = (e) => {
  const { cw, ch, mutateRate }:
   { cw: number, ch: number, mutateRate: number } = e.data
  console.log(cw, ch)

  const canvas = new OffscreenCanvas(cw, ch)
  const ctx = canvas.getContext("2d") ?? <never>console.log("aaah no canvas")

  function isVisited([x, y]: vec2, visited: boolean[]) {
    return visited[y * cw + x]
  }
  function setVisited([x, y]: vec2, visited: boolean[], wasVisited: boolean) {
    visited[y * cw + x] = wasVisited;
  }

  function isValid([x, y]: vec2) {
    return x >= 0 && x < cw && y >= 0 && y < ch;
  }

  function getNeighbors([x, y]: vec2) {
    return (<vec2[]>[
      //diagonal
      [x + 1, y + 1],
      [x + 1, y - 1],
      [x - 1, y + 1],
      [x - 1, y - 1],
      //straight 
      [x - 1, y - 0],
      [x + 1, y - 0],
      [x - 0, y - 1],
      [x - 0, y + 1],
    ]).filter(isValid)
  }

  function getPointData(img: ImageData, [x, y]: vec2) {
    const start = ((y * cw) + x) * 4
    return <vec4>Array.from(img.data.slice(start, start + 4))
  }

  function setPointData(img: ImageData, [x, y]: vec2, ...[r = 0, g = 0, b = 0, a = 0]: vec4) {
    const i = (((y * cw) + x) * 4)
    img.data[i] = r;
    img.data[i + 1] = g;
    img.data[i + 2] = b;
    img.data[i + 3] = a;
  }

  let numVisited = 0

  const progressMult = 1 / ((cw * ch) / 100)

  //set up required utility objects
  const visited: boolean[] = Array(cw * ch).fill(false)
  const img = ctx.createImageData(cw, ch)

  //setup que and start point
  const que: vec2[] = [[0, 0]]
  setPointData(img, [0, 1], 128, 0, 0, 255)
  setVisited([0, 1], visited, true)


  //clear canvas
  ctx.clearRect(0, 0, cw, ch);

  const update = () => {
    postMessage(<workerResponse>{
      completed: false,
      message: (
        ("visited: " +
          (numVisited * progressMult).toFixed(2) +
          "% que length: " +
          que.length)
      )
    })
  }

  //iterate through que
  while (que.length) {
    //if (abortRender.value) { abortRender.value = false; break }
    const curr = <vec2>que.pop()
    if (!isVisited(curr, visited)) {
      update()
      setVisited(curr, visited, true);
      numVisited++;
      const neighbors = getNeighbors(curr)
      que.push(...shuffle(neighbors));
      const neighborPaints = neighbors
        .filter(val => isVisited(val, visited))
        .map(n => getPointData(img, n))
      const avgPaint = vectorAvg(neighborPaints)
      const avgRed = avgPaint[0]
      setPointData(img, curr, mutate(avgRed, mutateRate, 0, 255), 0, 0, 255)

    }
  }
  ctx.putImageData(img, 0, 0)

  console.log("done!")
  postMessage(<workerResponse>{
    completed: true,
    message: (
      ("visited: " +
        (numVisited * progressMult).toFixed(2) +
        "% que length: " +
        que.length)
    ),
    data: img
  })

}
