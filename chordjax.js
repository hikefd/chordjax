class Lane {
    constructor(bars = []) {
        this.bars = bars;
    }
    getHTML() {
        return `<cjx-lane>${this.bars.map(bar => bar.getHTML()).join('')}</cjx-lane>`;
    }
}
class Bar {
    constructor(isSemi = false, chords = []) {
        this.isSemi = isSemi;
        this.chords = chords;
    }
    getHTML() {
        let str = this.chords.map(ch => ch.getHTML()).join('');
        if (this.isSemi) {
            return `<seg>${str}</seg>`;
        }
        return `<bar><seg>${str}</seg></bar>`;
    }
}
class Chord {
    constructor(root, opt, tri, ten) {
        this.root = root;
        this.opt = opt;
        this.tri = tri;
        this.ten = ten;
    }
    getHTML() {
        return `<chord><crt>${this.root ?? ''}</crt>`
            + `<cop>${this.opt ?? ''}</cop>`
            + `<ctr>${this.tri ?? ''}</ctr>`
            + `<ctn>${this.ten ?? ''}</ctn></chord>`;
    }
}
const ChordJax = {
    root: new Map([
        ['C', 'C'],
        ['D', 'D'],
        ['E', 'E'],
        ['F', 'F'],
        ['G', 'G'],
        ['A', 'A'],
        ['B', 'B'],
        ['-', '-'],
        ['.', ''],
        ['/', '/'],
        ['N', 'N.C.'],
        ['1', 'I'],
        ['2', 'II'],
        ['3', 'III'],
        ['4', 'IV'],
        ['5', 'V'],
        ['6', 'VI'],
        ['7', 'VII'],
    ]),
    opt: new Map([
        ['b', 'b'],
        ['#', '#'],
        //['b', '♭'],
        //['#', '♯'],
    ]),
    tri: new Map([
        ['m', ''],
    ]),
    parseBar(text, isSemi) {
        // barの中身を処理
        if (text == '') {
            return;
        }

        let bar = new Bar(isSemi);
        // 空白区切り、ただし[]や()内は別扱いしないといけない
        let stack = '';
        // ()内フラグ
        let braFlag = false;
        const flush = () => {
            if (stack) {
                bar.chords.push(this.parseChord(stack));
                stack = '';
            }
            braFlag = false;
        };
        for (let i=0; i<text.length; i++) {
            let t = text[i];
            if (t == '[') {
                flush();
                // [から]までの区間をparseBarsに渡す
                let idx = text.indexOf(']', i);
                if (idx < 0) {
                    idx = text.length;
                } 
                console.log(i, idx);
                bar.chords.push(this.parseBar(text.substring(i+1, idx), true));
                // iを更新
                i = idx;
                continue;
            }
            if (t == ' ' && !braFlag) {
                flush();
                continue;
            }
            // カッコ対応 ただしネストには対応していない
            if (t == '(') {
                braFlag = true;
            } else if (t == ')') {
                braFlag = false;
            }
            stack += t;
        }
        flush();
        return bar;
    },
    parseChord(text) {
        if (text == '') {
            return;
        }
        let chord = new Chord();
        let idx = 0;
        chord.root = this.root.get(text[0]);
        idx += 1;
        if (this.opt.get(text[idx])) {
            chord.opt = this.opt.get(text[idx]);
            idx += 1;
        }
        if (this.tri.get(text[idx])) {
            chord.tri = this.tri.get(text[idx]);
            idx += 1;
        }
        chord.ten = text.substring(idx);
        return chord;
    },
    render(text) {
        let html = '';
        let lanes = text.split(/\r\n|\r|\n/);
        lanes.forEach(lane => {
            if (lane == '') {
                return;
            }
            let currentLane = new Lane();
            // 連続可の縦線で区切る
            let bars = lane.split(/\|\|?/);
            bars.forEach((bar) => {
                let b = this.parseBar(bar);
                if (b) {
                    currentLane.bars.push(b);
                }
            });
            html += currentLane.getHTML();
        });

        
        

       return `<div class="chordJax">${html}</div>`;
    },
} 
export default ChordJax;