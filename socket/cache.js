module.exports = class UserSocketMapper {

    constructor() {
        this.cache = []
    }
    add(name,socketId){
        this.cache.push({
            name,
            socketId
        })
    }
    getUserList (){
        return this.cache.map(item => item.name)
    }
    getSocketIdByUsername(username){
        const targetItem = this.cache.find(item => item.name === username)
        return targetItem ? targetItem.socketId:null
    }
    getUsernameBySocketId(id){
        const targetItem = this.cache.find(item => item.socketIdc === id)
        return targetItem ? targetItem.name:null
    }
}