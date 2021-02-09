const ItemRenderer = class {
    get object() {throw 'override';}
    find(v) {throw 'override';}
    remove() {return this._remove();}
    move(x,y) {return this._move(x,y); }
    render(x,y,type,selected) {this._render(x,y, type, selected);}
    _remove() {throw 'override';}
    _move() {throw 'override';}
    _render() {throw 'override';}
};

