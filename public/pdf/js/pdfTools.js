const NAV_CLASS_NAME = "nav-item"
const MAIN_CLASS_NAME = "main-item"
const MAIN_DOM_CLASS_NAME = "main"
const NAV_CHOSEN_CLASS_NAME = "nav-item-anchor"

class Tools {
    // 加载完毕的pdf对象
    pdfDoc = null
    // 首次加载默认本体放大值
    SCALE_INIT = 5
    // 按钮缩放、放大比例
    scale = 1
    // 旋转
    rotation = 0
    // 渲染中
    pageRendering = false
    // 当前页码
    currentPage = 1
    // 当前正在加载的页码
    pageNumPending = null
    // 各个元素之间的间距(top)
    interval = 10
    // 双页展示
    double = true
    // 横向Gap
    intervalHorizontal = 5

    constructor(pdfjsLib) {
        this.pdfjsLib = pdfjsLib
        // ...
    }
    pdfOK() {
        return this.pdfDoc === null ? false : true
    }
    /**
     * 加载pdf
     * @param {*} pdfUrl 
     * @returns 
     */
    loadPdf(pdfUrl) {
        return new Promise((resolve, reject) => {
            this.pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
                resolve(pdf)
                this.pdfDoc = pdf
            }).catch(error => {
                reject(`'load PDF fail:', ${error}`)
            })
        })
    }
    /**
     * 在canvas中渲染单页
     * @param {*} pageNum 页码
     * @param {*} canvas 画布元素
     * @param {*} config 自定义配置
     * @returns 
     */
    renderPage(pageNum, canvas, config) {
        this.pageRendering = true;
        return new Promise((resolve, reject) => {
            this.pdfDoc.getPage(pageNum).then(page => {
                let viewport
                viewport = page.getViewport(this.viewportConfig(config))
                canvas.height = viewport.height
                canvas.width = viewport.width
                const renderContext = {
                    canvasContext: canvas.getContext('2d'),
                    viewport: viewport
                }
                page.render(renderContext).promise.then(() => {
                    this.pageRendering = false
                    if (this.pageNumPending !== null) {
                        this.renderPage(this.pageNumPending)
                        this.pageNumPending = null
                    }
                    resolve(pageNum)
                })
            })
        })
    }
    /**
     * 自定义视口配置
     * @param {*} obj 
     * @returns 
     */
    viewportConfig(obj) {
        if (!obj) {
            return {
                // default config
                scale: this.SCALE_INIT,
                rotation: this.rotation,
            }
        } else {
            return obj
        }
    }
    /**
     * 队列渲染
     * @param {*} pageNum 
     * @param {*} canvas 
     * @returns 
     */
    queueRenderPage(pageNum, canvas) {
        if (this.pageRendering) {
            this.pageNumPending = pageNum
        } else {
            return this.renderPage(pageNum, canvas)
        }
    }
    /**
     * 创建页签节点
     * @param {*} text 
     * @returns 
     */
    createPage(text) {
        const page = document.createElement('div')
        page.style.textAlign = "center"
        page.innerText = text
        return page
    }
    /**
     * 主元素核心样式生效:transform、top
     * @param {*} ele DOM元素
     * @param {*} top 
     * @returns 
     */
    ctlMainDomStyle(ele, top) {
        // 定义初始宽
        let width = this.checkOrigin(ele).width
        // 定义初始translateX偏移值
        let move = width / 2
        let rotateConfig = ""
        // 如果存在有效旋转
        if (this.rotation % 360) rotateConfig = `rotateZ(${this.rotation % 360}deg)`
        /* 
            根据旋转、父宽和内宽抉择translateX偏移量
        */
        const parWidth = document.getElementsByClassName("main")[0].offsetWidth

        if (this.double === true) {
            // 先判断是否有旋转
            if (this.rotation % 180) {
                if (parseInt(ele.getAttribute("index")) % 2) move = move + this.checkRotate(ele).width / 2 + this.intervalHorizontal  // 单页(左移)
                else move = move - this.checkRotate(ele).width / 2 - this.intervalHorizontal // 双页(右移)
            } else {
                if (parseInt(ele.getAttribute("index")) % 2) move = move + width / 2 + this.intervalHorizontal  // 单页(左移)
                else move = move - width / 2 - this.intervalHorizontal   // 双页(右移)
            }
            if (parWidth <= this.checkRotate(ele).width * 2) {
                move = move - (this.checkRotate(ele).width - parWidth / 2)
            }
        } else {
            if (parWidth <= this.checkRotate(ele).width) {
                move = move - (this.checkRotate(ele).width / 2 - parWidth / 2)
            }
        }
        ele.style.top = top + "px"
        ele.style.transform = `translateX(${-move}px) ${rotateConfig}`
    }
    /**
     * 初始化主元素的间距
     * 新增：双页控制
     * @param {*} dom 主元素
     * @param {*} i 页码
     */
    initMainDomGap(dom, i) {
        const extraTop = this.getRotateExtraTop(dom)
        this.ctlMainDomStyle(dom, this.getTop(i, dom) + extraTop)
    }
    /**
     * 创建节点，渲染所有页
     * @param {*} parDom 
     * @param {*} className 
     * @param {*} config 
     * @param {*} options 
     * @returns 
     */
    renderAll(parDom, className, config, options) {
        const arr = []
        if (this.pdfOK()) {
            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                const pageContainer = document.createElement('div')
                pageContainer.className = className
                pageContainer.setAttribute("index", i)
                pageContainer.id = className + "-" + i
                const canvas = document.createElement('canvas')

                pageContainer.appendChild(canvas)
                parDom.appendChild(pageContainer)

                arr.push(this.renderPage(i, canvas, config))
            }
            return Promise.all(arr)
        }
        return Promise.reject()
    }
    /**
     * 放大操作
     * @param {*} domList 
     */
    scaleAction(domList) {
        for (let i = 1; i <= this.pdfDoc.numPages; i++) {
            const canvas = domList[i - 1].firstChild
            canvas.style.transformOrigin = "0 0"
            canvas.style.transform = `scale(${this.scale})`
            const rect = canvas.getBoundingClientRect()
            domList[i - 1].style.height = rect.height + "px"
            domList[i - 1].style.width = rect.width + "px"
            // 缩放完毕后，处理元素之间的间距
            this.initMainDomGap(domList[i - 1], i)
        }
    }
    /**
     * 修改已有节点缩放
     * @param {*} scale 
     * @returns 
     */
    scaleAll(scale) {
        if (scale * this.SCALE_INIT > 5 || scale * this.SCALE_INIT < 0.5) return false
        else this.scale = scale
        // 获取主元素的高，并设置top
        const domList = document.getElementsByClassName(MAIN_CLASS_NAME)
        if (this.rotation % 180) {
            // 先清空父元素的transform
            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                domList[i - 1].style.transform = ``
            }
            // 先缩放，再旋转
            this.scaleAction(domList)
        } else {
            // 放大和缩放操作
            this.scaleAction(domList)
        }
    }
    /**
     * 旋转
     */
    rotateAll() {
        const domList = document.getElementsByClassName(MAIN_CLASS_NAME)
        for (let i = 1; i <= this.pdfDoc.numPages; i++) {
            domList[i - 1].style.transform = `rotateZ(${this.rotation % 360}deg)`
            // 初始化top
            this.initMainDomGap(domList[i - 1], i)
        }
    }
    /**
     * 渲染左侧导航元素
     * @param {*} parDom 
     * @param {*} config 
     * @returns 
     */
    renderAllNav(parDom, config) {
        return this.renderAll(parDom, NAV_CLASS_NAME, config)
    }
    /**
     * 渲染右侧主题元素
     * @param {*} parDom 
     * @param {*} config 
     * @returns 
     */
    renderAllMain(parDom, config) {
        return this.renderAll(parDom, MAIN_CLASS_NAME, config)
    }
    /**
     * 获取旋转后的高、宽
     * @param {*} ele 
     * @returns 
     */
    checkRotate(ele) {
        let width = getComputedStyle(ele).width.split("px")[0]
        let height = getComputedStyle(ele).height.split("px")[0]
        // 如果90 270度
        if (this.rotation % 180) {
            return { height: width, width: height }
        } else return {
            height,
            width
        }
    }
    /**
     * 获取原始高、宽
     * @param {*} ele 
     * @returns 
     */
    checkOrigin(ele) {
        let width = getComputedStyle(ele).width.split("px")[0]
        let height = getComputedStyle(ele).height.split("px")[0]
        return {
            height,
            width
        }
    }
    /**
     * 获取旋转后的额外top偏移量
     * @param {*} ele 
     * @returns 
     */
    getRotateExtraTop(ele) {
        let width = getComputedStyle(ele).width.split("px")[0]
        let height = getComputedStyle(ele).height.split("px")[0]
        // 如果90 270度
        if (this.rotation % 180) {
            const top = height / 2 - width / 2
            // 若元素的高>宽，top值应反向增加
            if (top >= 0) return -top
            else return -top
        } else return 0
    }
    /**
     * 返回单页、双页展示的top值
     * @param {*} index 页码 (index >= 1)
     * @param {*} dom DOM元素
     * @returns 
     */
    getTop(index, dom) {
        // 获取当前的高度
        const { height } = this.checkRotate(dom)
        if (this.double === true) {
            // 开启双页显示的高度
            let j
            if (index % 2) j = (index + 1) / 2 // index=奇数
            else j = index / 2 // index=偶数
            return height * (j - 1) + (j - 1) * this.interval
        }
        // 默认显示（单页）的高度
        return height * (index - 1) + (index - 1) * this.interval
    }
}

export {
    Tools,
}
export {
    NAV_CLASS_NAME,
    MAIN_CLASS_NAME,
    NAV_CHOSEN_CLASS_NAME
}