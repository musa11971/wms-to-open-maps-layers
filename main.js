let app = {
    converting: false,

    init() {
        this.updateStatus('Ready to convert.');

        document.getElementById('convert').addEventListener('click', this.convert.bind(this));
    },

    async convert() {
        if(this.converting) return;

        this.converting = true;

        this.updateStatus('Start converting...');

        document.getElementById('json-output').style.display = 'none';

        let input = document.getElementById('xml-input').value;
        let xmlDoc = this.tryParseXML(input);

        if(xmlDoc === null) {
            this.updateStatus('Error parsing XML.');
            this.converting = false;
            return;
        }

        // Loop through all XML layer elements
        let result = {
            default_layers: [],
            layers: {}
        };
        let layers = xmlDoc.getElementsByTagName('Layer');

        for(let i = 0; i < layers.length; i++) {
            let valid = false;
            let statusText = 'Checking layer with index ' + i + '...';
            this.updateStatus(statusText);

            let layer = layers[i];

            if(layer.firstElementChild != null && layer.firstElementChild.localName == 'Name') {
                let layerName = layer.firstElementChild.textContent;

                // Find the title
                for(j = 0; j < layer.children.length; j++) {
                    let child = layer.children[j];

                    if(child.localName !== 'Title') continue;

                    valid = true;
                    result.default_layers.push(layerName);
                    result.layers[layerName] = {
                        queryable: true,
                        title: child.textContent,
                        abstract: child.textContent
                    };

                    break;
                }
            }

            if(valid)
                this.updateStatus(statusText += ' (VALID)');

            await this.sleep(100);
        }

        this.updateStatus('Converted ' + result.default_layers.length  + ' layers.')
        
        let resultTextArea = document.getElementById('json-output');
        resultTextArea.value = JSON.stringify(result, null, 4);
        resultTextArea.style.display = 'block';
        this.converting = false;
    },

    tryParseXML(xmlString) {
        let parser = new DOMParser();
        let parsererrorNS = parser.parseFromString('INVALID', 'application/xml').getElementsByTagName("parsererror")[0].namespaceURI;
        let dom = parser.parseFromString(xmlString, 'application/xml');

        if(dom.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
            return null;
        }
        return dom;
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    updateStatus(status) {
        let statusEl = document.getElementById('status');
        statusEl.innerText = status;
    } 
};
app.init();