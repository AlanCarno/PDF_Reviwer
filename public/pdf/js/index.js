import { Tools, NAV_CLASS_NAME, MAIN_CLASS_NAME, NAV_CHOSEN_CLASS_NAME } from "./pdfTools.js"
import { getParentNode, staticScale } from "./tools.js"

window.onload = () => {
    const pdfUrl = new URL(window.location).hash.slice(1)   //截取hash值
    const pdfViewer = document.getElementById("pdf-viewer")
    const dots = document.getElementById("contatiner")
    const pageNumElement = document.getElementById('page-num')
    const pageCountElement = document.getElementById('page-count')
    const scaleNnum = document.getElementById('scale-num')
    const amplify = document.getElementById('amplify')
    const reduce = document.getElementById('reduce')
    const rotate = document.getElementById('rotate')
    const hide = document.getElementById('hide')
    const double = document.getElementById('double')
    const tools = new Tools(pdfjsLib)     // 初始化PDF对象
    scaleNnum.value = tools.scale * tools.SCALE_INIT * 100     // 初始化放大百分比

    tools.loadPdf(pdfUrl).then((pdf) => {
        // 创建导航
        tools.renderAllNav(document.getElementsByClassName("nav")[0], {
            scale: 0.2
        }).then(res => {
            // 绑定导航元素的点击事件
            const navList = document.getElementsByClassName(NAV_CLASS_NAME)
            for (let i = 0; i < navList.length; i++) {
                navList[i].addEventListener("click", (e) => {
                    let dom = getParentNode(e.target)
                    let id = dom.id
                    const domList = document.getElementsByClassName(MAIN_CLASS_NAME)
                    domList[parseInt(id.slice(id.length - 1)) - 1].scrollIntoView()
                })
            }
        })
        // 创建本体
        tools.renderAllMain(document.getElementsByClassName("main")[0], {
            scale: tools.scale * tools.SCALE_INIT
        }).then((res) => {
            const domList = document.getElementsByClassName(MAIN_CLASS_NAME)
            for(let i=0;i<domList.length;i++) {
                tools.initMainDomGap(domList[i],i+1)
            }
            // 手动触发缩放
            reduce.click()
            reduce.click()
            reduce.click()
            reduce.click()
            reduce.click()

            // 正式展示处理完后的样式，并移除等待动画 
            pdfViewer.style.visibility = "visible"
            dots.remove()
            pageCountElement.value = pdf.numPages
        })
    }, (err) => {
        console.log(err)
    })

    // 隐藏显示nav
    hide.addEventListener("click", () => {
        const left = document.getElementsByClassName("left")[0] ? document.getElementsByClassName("left")[0] : document.getElementsByClassName("left-hidden")[0]
        const main = document.getElementsByClassName("main-outer")[0] ? document.getElementsByClassName("main-outer")[0] : document.getElementsByClassName("main-outer-hidden")[0]
        left.className = document.getElementsByClassName("left")[0] ? "left-hidden" : "left"
        main.className = document.getElementsByClassName("main-outer")[0] ? "main-outer-hidden" : "main-outer"
        const show=document.getElementById("show")
        const unshow=document.getElementById("unshow")
        show.style.display=document.getElementsByClassName("left")[0] ? "":"none"
        unshow.style.display=document.getElementsByClassName("left")[0] ? "none":""
        staticScale(tools, scaleNnum)
    })
    // 单双页显示
    double.addEventListener("click",()=>{
        tools.double=!tools.double
        staticScale(tools, scaleNnum)
    })
    // 放大
    amplify.addEventListener("click", () => {
        tools.scaleAll(tools.scale + 0.1)
        scaleNnum.value = parseInt(tools.scale * tools.SCALE_INIT * 100)
    })
    // 缩小
    reduce.addEventListener("click", () => {
        tools.scaleAll(tools.scale - 0.1)
        scaleNnum.value = parseInt(tools.scale * tools.SCALE_INIT * 100)
    })
    // 旋转
    rotate.addEventListener("click", () => {
        tools.rotation += 90
        tools.rotateAll()
    })
    // 手动修改缩放值
    scaleNnum.addEventListener("change", (e) => {
        // 正则表达式验证整数或小数（不包括负数）
        const numberRegex = /^(?!0\d)([1-9]\d*|0)(\.\d+)?$/
        if (numberRegex.test(e.target.value)) {
            // 数字检测通过
            let type = tools.scaleAll(parseFloat(e.target.value / 100) / 5)
            if (typeof type === "boolean") {
                // 超过500或低于100
                e.target.value = Math.abs(e.target.value - 100) <= Math.abs(e.target.value - 500) ? 100 : 500
                tools.scale = Math.abs(e.target.value - 100) <= Math.abs(e.target.value - 500) ? 0.2 : 1
                tools.scaleAll(tools.scale)
            }
        } else {
            // 数字检测不通过，默认恢复放大值
            e.target.value = 100
            tools.scale = 0.2
            tools.scaleAll(tools.scale)
        }
    })
    // 手动修改页码
    pageNumElement.addEventListener("change", (e) => {
        const navList = document.getElementsByClassName(NAV_CLASS_NAME)
        const regex = /^[1-9]\d*$/
        if (regex.test(e.target.value)) {
            const v = parseInt(e.target.value)
            if (v >= 1 && v <= tools.pdfDoc.numPages) {
                navList[v - 1].click()
                return
            }
        }
        e.target.value = 1
        // 手动触发一次点击事件
        navList[0].click()
    })
    // 滑动时，左右侧位置保持一致
    document.getElementsByClassName("main-outer")[0].onscroll = () => {
        const domList = document.getElementsByClassName(MAIN_CLASS_NAME)
        const navList = document.getElementsByClassName(NAV_CLASS_NAME)
        if (domList && domList.length && navList && navList.length) {
            // 滑动栏滚动时左侧导航一致
            for (let i = domList.length - 1; i >= 0; i--) {
                if (domList[i].getBoundingClientRect().top - 60 <= 0) {
                    navList[i].scrollIntoView()
                    pageNumElement.value = i + 1
                    for (let j = 0; j < navList.length; j++) {
                        navList[j].className = NAV_CLASS_NAME
                    }
                    navList[i].className = `${NAV_CLASS_NAME} ${NAV_CHOSEN_CLASS_NAME}`
                    break
                }
            }
        }
    }
    // 窗口大小变化时，执行一次静态放大操作
    window.onresize = () => staticScale(tools, scaleNnum)
}
