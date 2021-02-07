const Game = class {
    constructor(setting) {
        prop(this, setting, {
            items: new Set,
            msg2item: new WeakMap,
            item2msg: new WeakMap,
            prevItem: null
        })
        
        const {renderer, row, column, items, item2msg} = this;
        renderer.setGame(this, row, column);
        for(let c=0; c<column; c++) {
            for(let r=0; r<row; r++) this._add(c, r);
        }
        Promise.all(items.map(item => {
            item.pos(item.x, item.y + row);
            return renderer.move(item2msg.get(item).pos(item.x, item.y));
        })).then(_=> renderer.activate());
    }
    
    _add(c,r) {
        const {itemType, row, items, msg2item, item2msg, renderer} = this;
        const item = new Item(itemType[parseInt(Math.random() * itemType.length)], c, r -row);
        const msg = new GameMsg;
        items.add(item);
        msg2item.set(msg, item);
        item2msg.set(item, msg);
        renderer.add(msg);
        return item;
    }

    _delete(item) {
        const msg = this.item2msg.get(item);
        this.msg2item.delete(msg);
        this.item2msg.delete(item);
        this.items.delete(item);
    }

    getInfo(msg) {
        const item = this.msg2item.get(msg);
        msg.info(item.x, item.y, item.type, item.selected);
        return msg;
    }

    selectStart(msg) {
        const item = this.msg2item.get(msg);
        if(!item)return;
        item.select();
        this.prevItem = item;
    }

    selectNext(msg) {
        const item= this.msg2item.get(msg);
        if(!item) return;

        const {prevItem:curr} = this;
        //자신이 아니고 타입이 같아야하며, 인접셀
        if(item == curr || item.type !== curr.type || !curr.isBorder(item))return;
        if(!curr.isSelectedList(item)) {
            item.select(curr);
            this.prevItem = item;
        } else {
            if(curr.prev === item) {
                this.prevItem = curr.prev;
                curr.unselect();
            }
        }
    }

    selectEnd() {
        const {items, item2msg, renderer} = this;
        const selecetd = [];
        items.forEach(v => v.selected && selected.push(item2msg.get(v)));
        if(selected.length >2)renderer.remove(selected).then(_ => this._clear());
        else items.forEach(v => v.unselect());
        this.prevItem = null;
    }

    _clear(selectedItem) {
        const {items, renderer} = this;
        renderer.deactivate();
        items.forEach(item => item.selected && this._delete(item));
        this._dropBlocks();
    }

    _dropBlocks() {
        const {items, column, row, renderer, tiem2msg} = this;
        const allItems = [];

        for(let i=row; i--;) allItems.push([]);
        items.forEach(item => (allItems[item.y][item.x] = item));

        const coll = [];
        for(let c=0; c<column; c++) {
            for(let r = row-1; r>-1; r--) {
                if(allItems[r] && allItems[r][c]) {
                    let cnt =0;
                    for(let j= r+1; j<row; j++) {
                        if(allItems[j] && !allItems[j][c]) cnt++;
                    }
                    if(cnt) {
                        const item = allItems[r][c];
                        item.pos(c, r+cnt);
                        coll.push(renderer.move(
                            item2msg.get(item).pos(item.x, item.y)));
                    }
                }
            }
        }
        if(coll.length) Promise.all(coll).then(_=>this.fillStart());
    }
}