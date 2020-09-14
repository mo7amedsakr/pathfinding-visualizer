import React, { FC, useState, useRef } from 'react';
import './Visualizer.css';
import { Node, INode } from './Node';
import { DFS } from '../algorithms/DFS';
import { BFS } from '../algorithms/BFS';
import { sleep } from '../sleep';
import { Maze } from '../algorithms/Maze';

export interface VisualizerProps {}

let START: [number, number];
let FINISH: [number, number];

const gridInit = (
  width: number = window.innerWidth,
  height: number = window.innerHeight
) => {
  const s = 26;
  const grid: INode[][] = [];

  for (let row = 0; row < height / s; row++) {
    const newRow = [];
    for (let col = 0; col < width / s; col++) {
      newRow.push({
        row,
        col,
        isVisited: false,
        isWall: false,
        isStart: false,
        isFinish: false,
        distance: Infinity,
      });
    }
    grid.push(newRow);
  }

  START = [Math.floor(height / s / 2), 2];
  FINISH = [Math.floor(height / s / 2), Math.floor(width / s) - 2];

  grid[START[0]][START[1]].isStart = true;
  grid[FINISH[0]][FINISH[1]].isFinish = true;

  return grid;
};

export const Visualizer: FC<VisualizerProps> = (props) => {
  const [isGo, setIsGo] = useState(false);
  const [grid, setGrid] = useState(gridInit());
  const [mouse, setMouse] = useState(false);
  const [speed, setSpeed] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const toggleWall = (node: INode) => {
    if (node.isFinish || node.isStart || isGo) return;
    setGrid((prev) => {
      const newGrid = [...prev];
      const { row, col, isWall } = { ...node };

      newGrid[row][col] = {
        ...node,
        isWall: !isWall,
      };

      return newGrid;
    });
  };

  const resetPath = () => {
    const rows = gridRef.current!.children;
    for (let r = 0; r < rows.length; r++) {
      const cols = rows.item(r)!.children;
      for (let c = 0; c < cols.length; c++) {
        (cols.item(c) as HTMLDivElement).style.backgroundColor = '';
      }
    }
  };

  const resetAll = () => {
    setGrid(gridInit());
    resetPath();
  };

  const drawSearch = async (steps: [number, number][]) => {
    const rows = gridRef.current!.children;
    for (let i = 0; i < steps.length; i++) {
      const [row, col] = steps[i];
      const cols = rows.item(row)!.children;
      (cols.item(col) as HTMLDivElement).style.backgroundColor =
        'rgba(17, 104, 217,0.3)';
      if (row === FINISH[0] && col === FINISH[1]) break;
      await sleep(speed);
    }
  };

  const drawPath = async (path: [number, number][] | null) => {
    if (!path) return;

    const rows = gridRef.current!.children;
    for (let i = path.length - 1; i >= 0; i--) {
      const [row, col] = path[i];
      const cols = rows.item(row)!.children;
      (cols.item(col) as HTMLDivElement).style.backgroundColor =
        'rgb(255, 254, 106)';
      await sleep(speed * 5);
    }
  };

  const goDFSgo = async () => {
    setIsGo(true);
    resetPath();
    const dfs = new DFS(grid, START);
    await drawSearch(dfs.getSteps());
    await drawPath(dfs.pathTo(FINISH[0], FINISH[1]));
    setIsGo(false);
  };

  const goBFSgo = async () => {
    setIsGo(true);
    resetPath();
    const bfs = new BFS(grid, START);
    await drawSearch(bfs.getSteps());
    await drawPath(bfs.pathTo(FINISH[0], FINISH[1]));
    setIsGo(false);
  };

  const openMouse = () => setMouse(true);
  const closeMouse = () => setMouse(false);

  const randomMaze = () => {
    resetAll();
    const maze = new Maze(grid);
    maze.randomMaze();
    setGrid(maze.getMaze());
  };

  // const perfectMaze = () => {
  //   resetAll();
  //   const maze = new Maze(grid);
  //   maze.perfectMaze(START[0], START[1]);
  //   setGrid(maze.getMaze());
  // };

  return (
    <>
      <div
        className="grid"
        ref={gridRef}
        onMouseDown={openMouse}
        onMouseUp={closeMouse}
        onMouseLeave={closeMouse}
      >
        {grid.map((row, i) => (
          <div className="row" key={i}>
            {row.map((node, j) => (
              <Node
                key={j}
                {...node}
                onMouseEnter={() => (mouse ? toggleWall(node) : null)}
                onMouseDown={() => toggleWall(node)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="buttons">
        <button onClick={resetAll} disabled={isGo}>
          Reset All
        </button>
        <button onClick={resetPath} disabled={isGo}>
          Reset Path
        </button>
        <button onClick={randomMaze} disabled={isGo}>
          Random Maze
        </button>
        {/* <button onClick={perfectMaze} disabled={isGo}>
          Perfect Maze
        </button> */}
        <button onClick={goDFSgo} disabled={isGo}>
          DFS
        </button>
        <button onClick={goBFSgo} disabled={isGo}>
          BFS
        </button>
      </div>
    </>
  );
};
