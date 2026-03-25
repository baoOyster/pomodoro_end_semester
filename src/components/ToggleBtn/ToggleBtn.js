class Toggle {
    constructor(className, svg, svgAlt) {
        return this.onInit(className, svg, svgAlt);
    };

    onInit(className, svg, svgAlt) {
        return `
            <div class="toggle ${className}">
                <div>
                    ${svg ? `<img src=${svg} alt="${svgAlt}"/>` : ''}
                </div>
            </div>
        `;
    }

    _bindOnClick(valueName){
        localStorage.setItem(valueName, localStorage.getItem(valueName) === 'true' ? 'false' : 'true'); 
    }
}

export default Toggle;