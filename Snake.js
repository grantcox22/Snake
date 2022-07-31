import React, { useRef, useState, useEffect } from 'react';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import './style.css'

const GRID_SIZE = 20;
const GRID_WIDTH = 40;

const COLOR_SCHEME = {
    accent : "#e82c6e",
    apple : "#e82c6e",
    snake : "#42e82c"
}

const GAME = 0;
const GAMEOVER = 1;

class Apple {
    constructor (color) {
        this.x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        this.y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        this.width = GRID_WIDTH;
        this.color = color;
    }

    respawn() {
        this.x = Math.floor(Math.random() * GRID_SIZE);
        this.y = Math.floor(Math.random() * GRID_SIZE);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * this.width, 50 + this.y * this.width, this.width, this.width);
    }  
}

class Snake {
    constructor(x,y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.dx = 0;
        this.dy = 0;
        this.ndx = 0;
        this.ndy = 0;
        this.tailLen = 2;
        this.tailX = [];
        this.tailY = [];
        this.width = GRID_WIDTH;
    }

    update(score, highscore, apple, gameState) {
        this.dx = this.ndx;
        this.dy = this.ndy;

        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x + this.dx > 20 || this.y < 0 || this.y + this.dy > 20) {
            this.dead(score, highscore, apple, gameState);
        }

        if (this.x == apple.x && this.y == apple.y) {
            apple.respawn();
            score.current++;
            this.tailLen++;
        }

        if (this.tailLen > 2) {
            for (let i = 0; i < this.tailLen; i++) {
                if (this.x == this.tailX[i] && this.y == this.tailY[i]) this.dead();
                if (apple.x == this.tailX[i] && apple.y == this.tailY[i]) apple.respawn();
            }
        }

        let prevX = this.tailX[0];
        let prevY = this.tailY[0];
        this.tailX[0] = this.x;
        this.tailY[0] = this.y;
        for (let i = 0; i < this.tailLen; i++) {
            let prev2X = this.tailX[i];
            let prev2Y = this.tailY[i];
            this.tailX[i] = prevX;
            this.tailY[i] = prevY;
            prevX = prev2X;
            prevY = prev2Y;
        }

    }

    draw(ctx) {
        ctx.fillStyle = COLOR_SCHEME.snake;
        ctx.fillRect(this.x * this.width, 50 + this.y * this.width, this.width, this.width);
        for (let i = 0; i < this.tailLen; i++) {
            ctx.fillRect(this.tailX[i] * this.width, 50 + this.tailY[i] * this.width, this.width, this.width);
        }
    }

    dead(score, highscore, apple, gameState) {
        this.x = 1;
        this.y = 1;
        this.ndx = 0;
        this.ndy = 0;
        this.tailLen = 2;
        this.tailX = [];
        this.tailY = [];
        gameState.current = GAMEOVER;
        if (score.current > highscore.current) {
            highscore.current = score.current;
            window.localStorage.setItem("highscore", score.current);
        }
        apple.respawn();
    }

}

function layeredText(txt, x, y, color, background, ctx) {
    ctx.fillStyle = background;
    ctx.fillText(txt, x+ 5, y);
    ctx.fillStyle = color;
    ctx.fillText(txt, x, y);
}

export default function SnakeGame() {

    const canvasRef = useRef();
    const ctx = useRef(null);

    const score = useRef(0);
    const highscore = useRef(0);
    const gameState = useRef(0);

    const player = useRef(new Snake(1, 1, COLOR_SCHEME.snake));
    const apple = useRef(new Apple(COLOR_SCHEME.apple));

    window.onload = () => {
        if (window.localStorage.getItem("highscore") != null) {
            highscore.current = JSON.parse(window.localStorage.getItem("highscore"));
        }
    }
    window.onkeydown = (e) => {
        if (gameState.current == GAME) {
            if (player.current.tailLen > 2) {
                if (e.keyCode == 37 && player.current.dx != 1) {
                    player.current.ndx = -1;
                    player.current.ndy = 0;
                }   else if (e.keyCode == 39 && player.current.dx != -1) {
                    player.current.ndx = 1;
                    player.current.ndy = 0;
                }   else if (e.keyCode == 38 && player.current.dy != 1) {
                    player.current.ndx = 0;
                    player.current.ndy = -1;
                }   else if (e.keyCode == 40 && player.current.dy != -1) {
                    player.current.ndx = 0;
                    player.current.ndy = 1;
                }
            }
            else {
                if (e.keyCode == 37) {
                    player.current.ndx = -1;
                    player.current.ndy = 0;
                }   else if (e.keyCode == 39) {
                    player.current.ndx = 1;
                    player.current.ndy = 0;
                }   else if (e.keyCode == 38) {
                    player.current.ndx = 0;
                    player.current.ndy = -1;
                }   else if (e.keyCode == 40) {
                    player.current.ndx = 0;
                    player.current.ndy = 1;
                }
            }
        } else {
            gameState.current = GAME;
            score.current = 0;
        }    
    }

    useEffect(() => {
        const canvas = canvasRef.current;

        const context = canvas.getContext('2d');
        context.canvas.width = 800;
        context.canvas.height = 850;

        ctx.current = context;

        setInterval(draw, 10);
        setInterval(update, 80);

    });
    
    function scoreBoard(ctx) {
        ctx.font = '40px VT323';
        ctx.fillStyle = COLOR_SCHEME.accent;
        ctx.fillRect(0,0,800,50);
        ctx.fillStyle = "white";
        ctx.textBaseline = 'top';
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${score.current}`, 10,2);
        ctx.textAlign = "right";
        ctx.fillText(`Highscore: ${highscore.current}`, ctx.canvas.width - 15, 2);
    }

    function grid(ctx) {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if ((i + j + 1) % 2 == 0) {
                    ctx.fillStyle = "#0c0c0c";
                } else {
                    ctx.fillStyle = "#000";
                }
                ctx.fillRect(i*40,j*40+50,40,40);
            }
        }
    }

    function gameOver(ctx) {
        ctx.textAlign = "center";
        ctx.textBaseline = "center";
        ctx.fillStyle = "red";
        ctx.font = '150px VT323';
        layeredText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2 - 100, "white", "red", ctx);
        ctx.font = '50px VT323';
        layeredText("PRESS ANY KEY", ctx.canvas.width / 2, ctx.canvas.height / 2 + 30, "white", "red", ctx);
    }

    function update() {
        player.current.update(score, highscore, apple.current, gameState);
    }

    function draw() {

        ctx.current.clearRect(0, 0, 800, 850);

        scoreBoard(ctx.current);
        grid(ctx.current);

        if (gameState.current == GAME) {
            apple.current.draw(ctx.current);
            player.current.draw(ctx.current);
        } else gameOver(ctx.current);

        ctx.current.strokeStyle = COLOR_SCHEME.accent;
        ctx.current.lineWidth = 10;
        ctx.current.strokeRect(0, 0, 800, 850);
    }

    return (
        <>
        {window.innerWidth >= 400 && window.innerHeight >= 425 ? <div className="snake"><canvas ref={canvasRef}></canvas></div> : <div className='noresult'><h4>Resolution Not Supported</h4></div>}
        <a href="./"><Logo className="logo" /></a>
        </>
    );
}

