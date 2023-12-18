export class Point {
    constructor(x: number, y: number, type: number, adjacent: number, surround: number, use: number, neighbor?: number[], adjacent_dia?: number[], type2?: number);
    x: number;
    y: number;
    type: number;
    type2: number;
    adjacent: number;
    adjacent_dia: number[];
    surround: number;
    neighbor: number[];
    use: number;
}
export class Stack {
    set(list: any): void;
    push(o: any): void;
    pop(): any;
    size(): number;
    toString(): string;
}

type Pu_qa = {
    command_redo: Stack;
    command_undo: Stack;
    command_replay: Stack;
    
    surface: Dictionary<number>;
    number: Dictionary;
    numberS: Dictionary;
    symbol: Dictionary;
    freeline: Dictionary<number>;
    freelineE: Dictionary<number>;
    line: Dictionary<number>;
    lineE: Dictionary<number>;
    wall: Dictionary<number>;
    cage: Dictionary<number>;
    deletelineE: Dictionary<number>;
    thermo: (number | undefined)[];
    arrows: (number | undefined)[];
    direction: (number | undefined)[];
    squareframe: (number | undefined)[];
    polygon: (number | undefined)[];
    killercages: (number | undefined)[];
    nobulbthermo: (number | undefined)[];
}

type Pu_qa_col = {
    surface: Dictionary<string>;
    number: Dictionary<string>;
    numberS: Dictionary<string>;
    symbol: Dictionary<string>;
    freeline: Dictionary<string>;
    freelineE: Dictionary<string>;
    line: Dictionary<string>;
    lineE: Dictionary<string>;
    wall: Dictionary<string>;
    cage: Dictionary<string>;
    deletelineE: Dictionary<string>;
    thermo: (string | undefined)[];
    arrows: (string | undefined)[];
    direction: (string | undefined)[];
    squareframe: (string | undefined)[];
    polygon: (string | undefined)[];
    killercages: (string | undefined)[];
    nobulbthermo: (string | undefined)[];
}

type Pu_mode = {
    edit_mode: string;
    surface: (string | number)[];
    line: (string | number)[];
    lineE: (string | number)[];
    wall: (string | number)[];
    cage: (string | number)[];
    number: (string | number)[];
    symbol: (string | number)[];
    special: string[];
    board: string[];
    move: string[];
    combi: string[];
    sudoku: (string | number)[];
}

export class PenpaPuzzle {
    constructor(gridtype: string);
    gridtype: string;
    canvasx: number;
    canvasy: number;
    center_n: number;
    center_n0: number;
    margin: number;
    ctx: any;
    mode: {
        qa: string;
        grid: string[];
        pu_q: Pu_mode;
        pu_a: Pu_mode;
    };
    pu_q: Pu_qa;
    pu_a: Pu_qa;
    pu_q_col: Pu_qa_col;
    pu_a_col: Pu_qa_col;
    theta: number;
    reflect: number[];
    centerlist: number[];
    solution: string;
    rules: string;
    replace: string[][];
    version: number[];
    multisolution: boolean;
    borderwarning: boolean;
    user_tags: string[];
    url: string;
    frame: {};
    point: Point[];
    space: number[];
    width: number;
    height: number;
    selection: number[];
    originalnx: number;
    originalny: number;
    ny: number;
    ny0: number;
    height0: number;
    height_c: number;
    cursol: number;
    cursolS: number;
    nx: number;
    nx0: number;
    width0: number;
    width_c: number;
    _document: any;

    reset(): void;
    reset_frame(): void;
    mode_grid(mode: string): void;
    draw_panel(): void;
    mode_set(v: any): void;
    mode_qa(mode: string): void;
    subcombimode(v: any): void;
    redraw(): void;
    make_frameline(): void;
    submode_check(v: any): void;
    canvas_size_setting(): void;
    record(): void;
    subsymbolmode(mode: string): void;
    point_usecheck(): void;
    canvasxy_update(): void;
    point_move(x: number, y: number, theta: number): void;
    search_center(): void;
    find_common(pu: any, i: number, endpoint: number, symboltype: string): 0 | 1;
    point_reflect_LR(): void;
    point_reflect_UD(): void;
    resize_top(sign: any, celltype?: string): void;
    resize_bottom(sign: any, celltype?: string): void;
    resize_left(sign: any, celltype?: string): void;
    resize_right(sign: any, celltype?: string): void;
}
export class Puzzle_square extends PenpaPuzzle {
    constructor(nx: number, ny: number, size: number);
    sudoku: number[];
    canvasx: number;
    canvasy: number;
    size: number;
    _size: number;

    create_point(): void;
    draw_sudokugrid(rows: number, cols: number, start: number, end: number, linestyle: number): void;
    draw_kakurogrid(): void;
}
export class Puzzle_sudoku extends Puzzle_square {
    gridtype: string;
    _size: number;
}
export class Puzzle_kakuro extends Puzzle_square {
}
