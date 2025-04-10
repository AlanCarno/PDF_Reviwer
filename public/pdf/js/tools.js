// 获取父节点
export const getParentNode=(ele) => {
    const req = /^(nav-item-)/g
    if (req.test(ele.id)) return ele
    if (ele.parentNode !== null) {
        ele = ele.parentNode
        return getParentNode(ele)
    }
}
// 执行静态放大
export const staticScale=(obj,scaleNum)=>{
    obj.scaleAll(obj.scale)
    scaleNum.value = parseInt(obj.scale * obj.SCALE_INIT * 100)
}