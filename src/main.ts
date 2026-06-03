import { Board, type BoardContact } from "@board.fun/web-sdk";

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
const gridCellSize = 60;
let contacts: ReadonlyArray<BoardContact> = [];

if (Board.isOnDevice) {
  Board.input.subscribe((snapshot) => {
    contacts = snapshot;
    draw();
  });
}

function draw() {
  const columnCount = Math.floor(canvas.width / gridCellSize);
  const rowCount = Math.floor(canvas.height / gridCellSize);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  for (let column = 0; column <= columnCount; column++) {
    const x = column * gridCellSize;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rowCount * gridCellSize);
    ctx.stroke();
  }

  for (let row = 0; row <= rowCount; row++) {
    const y = row * gridCellSize;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(columnCount * gridCellSize, y);
    ctx.stroke();
  }

  for (const c of contacts) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 40, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

draw();
