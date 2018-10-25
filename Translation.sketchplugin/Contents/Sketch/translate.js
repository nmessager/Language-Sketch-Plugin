@import 'utils.js'

var overrideId = 0;

function translateFile(context, filePath){
	var currentString = NSString.stringWithContentsOfFile_encoding_error(filePath, NSUTF8StringEncoding, null);
	var currentJsonObject = JSON.parse(currentString.toString());
	var keys = currentJsonObject["keys"];

    var comboBoxContainer = [[NSView alloc] initWithFrame:NSMakeRect(0,0,200,25)];
    var comboxBox = [[NSComboBox alloc] initWithFrame:NSMakeRect(0,0,200,25)];
    [comboxBox addItemsWithObjectValues:keys];
    [comboxBox selectItemAtIndex:0];
    [comboBoxContainer addSubview:comboxBox];

    var languageDialog = [[NSAlert alloc] init];
    [languageDialog setMessageText:"Select language to translate"];
    [languageDialog addButtonWithTitle:'OK']
    [languageDialog addButtonWithTitle:'Cancel']
    [languageDialog setAccessoryView:comboBoxContainer]

    if ([languageDialog runModal] == NSAlertFirstButtonReturn) {
		var keyIndex = [comboxBox indexOfSelectedItem];
		var currentPage = context.document.currentPage();
		translateTextLayers(currentPage,currentJsonObject,keys[keyIndex]);
		translateSymbolsOverrides(currentPage,currentJsonObject,keys[keyIndex]);
		alert("Translate","Completed!");
	}
}


function translateTextLayers(page, jsonObject, languageKey){
 		var textLayers = getTextLayersOfPage(page);

        for (var i = 0; i < textLayers.length; i++) {
            var textLayer = textLayers[i];
            var stringValue = unescape(textLayer.name());
            if(jsonObject[stringValue]){
                var localeObject = jsonObject[stringValue];
                textLayer.setStringValue(localeObject[languageKey]);
                [textLayer adjustFrameToFit];
            }
        }

}

function translateSymbolsOverrides(page, jsonObject, languageKey) {
    var layers = [page children];
    stringOverrides = [];
  
    for (var i = 0; i < layers.count(); i++) {
        var layer = [layers objectAtIndex: i];
        if (isSymbol(layer) && isNeedTranslate(layer)) {
            replaceStringOverridesInSymbols(layer, jsonObject, languageKey);
        }
    }
}

function replaceStringOverridesInSymbols(symbol, jsonObject, languageKey) {

    overrideId = 0;

    var existingOverrides = symbol.overrides() || NSDictionary.dictionary();
    var overrides = NSMutableDictionary.dictionaryWithDictionary(existingOverrides);
    var keys = overrides.allKeys();
  
    for (var i = 0; i < keys.count(); i++) {
        var index = keys.objectAtIndex(i);
        if(overrides[index].class().isSubclassOfClass_(NSMutableDictionary.class()) ) {
            overrides[index] = replaceStringOverridesInSymbolsInception(overrides[index], jsonObject, languageKey, symbol);
        } else if(overrides[index].class().isSubclassOfClass_(NSString.class()) ) {
            var stringValue = unescape(symbol.name() + "_" + overrideId);
            if(jsonObject[stringValue]){
                var localeObject = jsonObject[stringValue];
                overrides[index] = localeObject[languageKey];
                overrideId++;
            }
        }
    }
    
    symbol.overrides = overrides;
  }
  
  function replaceStringOverridesInSymbolsInception(overrides, jsonObject, languageKey, symbol) {
    var keys = overrides.allKeys();
  
    for (var i = 0; i < keys.count(); i++) {
        var index = keys.objectAtIndex(i);
        if(overrides[index].class().isSubclassOfClass_(NSMutableDictionary.class()) ) {
            overrides[index] = replaceStringOverridesInSymbolsInception(overrides[index], jsonObject, languageKey, symbol);
        } else if(overrides[index].class().isSubclassOfClass_(NSString.class()) ) {
            var stringValue = symbol.name() + "_" + overrideId;
            if(jsonObject[stringValue]){
                var localeObject = jsonObject[stringValue];
                overrides[index] = localeObject[languageKey];
                overrideId++;
            }
        }
    }
  
    return overrides;
  }