export class LoginBody {
    public accountsId!: number;
    public expiration: number;
    public storeId!: number;
    constructor() {
        this.expiration = 1;
    }
}
