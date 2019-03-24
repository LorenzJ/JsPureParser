export class Result {
    constructor(stream) {
        this.stream = stream;
    }
    map(_) { throw undefined; }
    bind(_) { throw undefined; }
}

export class Success extends Result {
    constructor(value, stream) {
        super(stream);
        this.value = value;
        Object.freeze(this);
    }
    map(f) {
        const [value, stream] = f(this.value, this.stream);
        return new Success(value, stream);
    }
    bind(f) {
        return f(this.value, this.stream);
    }
}

export class Failure extends Result {
    constructor(message, stream) {
        super(stream);
        this.message = message;
        Object.freeze(this);
    }
    map(_) {
        return this;
    }
    bind(_) {
        return this;
    }
}