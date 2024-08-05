//오류가 생기면 메시지를 띄우고 다음 함수를 진행한다.
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}