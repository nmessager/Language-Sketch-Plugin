var overrideId =  0;

function alert(title, message) {
  var app = [NSApplication sharedApplication];
  [app displayDialog: message withTitle: title];
}

function isTextLayer(layer) {
  if (layer.class() === MSTextLayer) {
    return true;
  }

  return false;
}

function isSymbol(layer) {
  if (layer.class() === MSSymbolInstance) {
    return true;
  }

  return false;
}

function isNeedTranslate(layer) {
  var layerName = layer.name();
  if (layerName.indexOf("o_") == -1)
    return false;

  return true;
}


function isExistFilePath(filePath) {
  var fileManager = [NSFileManager defaultManager];
  return [fileManager fileExistsAtPath: filePath];
}

function getTextLayersOfPage(pages) {
  var layers = [pages children];
  textLayers = [];

  for (var i = 0; i < layers.count(); i++) {
    var layer = [layers objectAtIndex: i];
    if (isTextLayer(layer) && isNeedTranslate(layer)) {
      textLayers.push(layer);
    }
  }

  return textLayers;
}

function getTextLayersOfSelections(selections) {
  var textLayers = [];

  for (var i = 0; i < selections.count(); i++) {
    var layer = [selections objectAtIndex: i];
    if (isTextLayer(layer) && isNeedTranslate(layer)) {
      textLayers.push({"name":layer.name(),"value":layer.stringValue()});
    }

    if (isSymbol(layer) && isNeedTranslate(layer)) {
      var symbolOverrides = getStringOverridesInSymbols(layer);
      for (var j = 0; j < symbolOverrides.length; j++) {
        textLayers.push({"name":unescape(layer.name() + "_" + symbolOverrides[j].id),"value":symbolOverrides[j].value});
      }
    }
  }

  return textLayers;
}


function getStringOverridesInSymbols(symbol) {

  var stringOverrides = [];
  overrideId =  0;

  var existingOverrides = symbol.overrides() || NSDictionary.dictionary();
  var overrides = NSMutableDictionary.dictionaryWithDictionary(existingOverrides);
  var keys = overrides.allKeys();

  for (var i = 0; i < keys.count(); i++) {
    var index = keys.objectAtIndex(i);
    if(overrides[index].class().isSubclassOfClass_(NSMutableDictionary.class()) ) {
      getStringOverridesInSymbolsInception(overrides[index], stringOverrides, symbol);
    } else if(overrides[index].class().isSubclassOfClass_(NSString.class()) ) {
      stringOverrides.push({"id":overrideId,"value":overrides[index]});
      overrideId++;
    }
  }
  
  return stringOverrides;
}

function getStringOverridesInSymbolsInception(overrides, stringOverrides, symbol) {
  var keys = overrides.allKeys();

  for (var i = 0; i < keys.count(); i++) {
    var index = keys.objectAtIndex(i);
    if(overrides[index].class().isSubclassOfClass_(NSMutableDictionary.class()) ) {
      getStringOverridesInSymbolsInception(overrides[index], stringOverrides, symbol);
    } else if(overrides[index].class().isSubclassOfClass_(NSString.class()) ) {
      stringOverrides.push({"id":overrideId,"value":overrides[index]});
      overrideId++;
    }
  }

  return;
}

