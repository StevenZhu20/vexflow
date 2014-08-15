// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

Vex.Flow.STEM_WIDTH = 1.5;
Vex.Flow.STEM_HEIGHT = 32;
Vex.Flow.STAVE_LINE_THICKNESS = 2;

Vex.Flow.clefProperties = function(clef) {
  if (!clef) throw new Vex.RERR("BadArgument", "Invalid clef: " + clef);

  var props = Vex.Flow.clefProperties.values[clef];
  if (!props) throw new Vex.RERR("BadArgument", "Invalid clef: " + clef);

  return props;
};

Vex.Flow.clefProperties.values = {
  'treble':  { line_shift: 0 },
  'bass':    { line_shift: 6 },
  'tenor':   { line_shift: 4 },
  'alto':    { line_shift: 3 },
  'soprano': { line_shift: 1 },
  'percussion': { line_shift: 0 },
  'mezzo-soprano': { line_shift: 2 },
  'baritone-c': { line_shift: 5 },
  'baritone-f': { line_shift: 5 },
  'subbass': { line_shift: 7 },
  'french': { line_shift: -1 }
};

/*
  Take a note in the format "Key/Octave" (e.g., "C/5") and return properties.

  The last argument, params, is a struct the currently can contain one option, 
  octave_shift for clef ottavation (0 = default; 1 = 8va; -1 = 8vb, etc.).
*/
Vex.Flow.keyProperties = function(key, clef, params) {
  if (clef === undefined) {
    clef = 'treble';
  }
  var options = {
    octave_shift: 0
  };
  if (typeof params == "object") {
    Vex.Merge(options, params);
  }

  var pieces = key.split("/");

  if (pieces.length < 2) {
    throw new Vex.RERR("BadArguments",
        "Key must have note + octave and an optional glyph: " + key);
  }

  var k = pieces[0].toUpperCase();
  var value = Vex.Flow.keyProperties.note_values[k];
  if (!value) throw new Vex.RERR("BadArguments", "Invalid key name: " + k);
  if (value.octave) pieces[1] = value.octave;

  var o = parseInt(pieces[1]);

  // Octave_shift is the shift to compensate for clef 8va/8vb.
  o += -1 * options.octave_shift;

  var base_index = (o * 7) - (4 * 7);
  var line = (base_index + value.index) / 2;
  line += Vex.Flow.clefProperties(clef).line_shift;

  var stroke = 0;

  if (line <= 0 && (((line * 2) % 2) === 0)) stroke = 1;  // stroke up
  if (line >= 6 && (((line * 2) % 2) === 0)) stroke = -1; // stroke down

  // Integer value for note arithmetic.
  var int_value = (typeof(value.int_val)!='undefined') ? (o * 12) +
    value.int_val : null;

  /* Check if the user specified a glyph. */
  var code = value.code;
  var shift_right = value.shift_right;
  if ((pieces.length > 2) && (pieces[2])) {
    var glyph_name = pieces[2].toUpperCase();
    var note_glyph = Vex.Flow.keyProperties.note_glyph[glyph_name];
    if (note_glyph) {
      code = note_glyph.code;
      shift_right = note_glyph.shift_right;
    }
  }

  return {
    key: k,
    octave: o,
    line: line,
    int_value: int_value,
    accidental: value.accidental,
    code: code,
    stroke: stroke,
    shift_right: shift_right,
    displaced: false
  };
};

Vex.Flow.keyProperties.note_values = {
  'C':  { index: 0, int_val: 0, accidental: null },
  'CN': { index: 0, int_val: 0, accidental: "n" },
  'C#': { index: 0, int_val: 1, accidental: "#" },
  'C##': { index: 0, int_val: 2, accidental: "##" },
  'CB': { index: 0, int_val: -1, accidental: "b" },
  'CBB': { index: 0, int_val: -2, accidental: "bb" },
  'D':  { index: 1, int_val: 2, accidental: null },
  'DN': { index: 1, int_val: 2, accidental: "n" },
  'D#': { index: 1, int_val: 3, accidental: "#" },
  'D##': { index: 1, int_val: 4, accidental: "##" },
  'DB': { index: 1, int_val: 1, accidental: "b" },
  'DBB': { index: 1, int_val: 0, accidental: "bb" },
  'E':  { index: 2, int_val: 4, accidental: null },
  'EN': { index: 2, int_val: 4, accidental: "n" },
  'E#': { index: 2, int_val: 5, accidental: "#" },
  'E##': { index: 2, int_val: 6, accidental: "##" },
  'EB': { index: 2, int_val: 3, accidental: "b" },
  'EBB': { index: 2, int_val: 2, accidental: "bb" },
  'F':  { index: 3, int_val: 5, accidental: null },
  'FN': { index: 3, int_val: 5, accidental: "n" },
  'F#': { index: 3, int_val: 6, accidental: "#" },
  'F##': { index: 3, int_val: 7, accidental: "##" },
  'FB': { index: 3, int_val: 4, accidental: "b" },
  'FBB': { index: 3, int_val: 3, accidental: "bb" },
  'G':  { index: 4, int_val: 7, accidental: null },
  'GN': { index: 4, int_val: 7, accidental: "n" },
  'G#': { index: 4, int_val: 8, accidental: "#" },
  'G##': { index: 4, int_val: 9, accidental: "##" },
  'GB': { index: 4, int_val: 6, accidental: "b" },
  'GBB': { index: 4, int_val: 5, accidental: "bb" },
  'A':  { index: 5, int_val: 9, accidental: null },
  'AN': { index: 5, int_val: 9, accidental: "n" },
  'A#': { index: 5, int_val: 10, accidental: "#" },
  'A##': { index: 5, int_val: 11, accidental: "##" },
  'AB': { index: 5, int_val: 8, accidental: "b" },
  'ABB': { index: 5, int_val: 7, accidental: "bb" },
  'B':  { index: 6, int_val: 11, accidental: null },
  'BN': { index: 6, int_val: 11, accidental: "n" },
  'B#': { index: 6, int_val: 12, accidental: "#" },
  'B##': { index: 6, int_val: 13, accidental: "##" },
  'BB': { index: 6, int_val: 10, accidental: "b" },
  'BBB': { index: 6, int_val: 9, accidental: "bb" },
  'R': { index: 6, int_val: 9, rest: true }, // Rest
  'X':  {
    index: 6,
    accidental: "",
    octave: 4,
    code: "noteheadXBlack",
    shift_right: 5.5
  }
};

Vex.Flow.keyProperties.note_glyph = {
  /* Diamond */
  'D0':  { code: "noteheadDiamondWhole", shift_right: -0.5 },
  'D1':  { code: "noteheadDiamondHalf", shift_right: -0.5 },
  'D2':  { code: "noteheadBlack", shift_right: -0.5 },
  'D3':  { code: "noteheadBlack", shift_right: -0.5 },

  /* Triangle */
  'T0':  { code: "noteheadTriangleUpWhole", shift_right: -2 },
  'T1':  { code: "noteheadTriangleUpHalf", shift_right: 0.5 },
  'T2':  { code: "noteheadTriangleUpBlack", shift_right: 0.5 },
  'T3':  { code: "noteheadTriangleUpBlack", shift_right: 0.5 },

  /* Cross */
  'X0':  { code: "noteheadXWhole", shift_right: -2 },
  'X1':  { code: "noteheadXHalf", shift_right: -0.5 },
  'X2':  { code: "noteheadXOrnate", shift_right: 0.5 },
  'X3':  { code: "noteheadCircleX", shift_right: -2 }
};

Vex.Flow.integerToNote = function(integer) {
  if (typeof(integer) == "undefined")
    throw new Vex.RERR("BadArguments", "Undefined integer for integerToNote");

  if (integer < -2)
    throw new Vex.RERR("BadArguments",
        "integerToNote requires integer > -2: " + integer);

  var noteValue = Vex.Flow.integerToNote.table[integer];
  if (!noteValue)
    throw new Vex.RERR("BadArguments", "Unknown note value for integer: " +
        integer);

  return noteValue;
};

Vex.Flow.integerToNote.table = {
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B"
};


Vex.Flow.tabToGlyph = function(fret) {
  var glyph = null;
  var width = 0;
  var shift_y = 0;

  if (fret.toString().toUpperCase() == "X") {
    glyph = "noteheadXOrnate";
    width = 7;
    shift_y = -4.5;
  } else {
    width = Vex.Flow.textWidth(fret.toString());
  }

  return {
    text: fret,
    code: glyph,
    width: width,
    shift_y: shift_y
  };
};

Vex.Flow.textWidth = function(text) {
  return 6 * text.toString().length;
};

Vex.Flow.articulationCodes = function(artic) {
  var articulationMeta = Vex.Flow.articulationCodes.articulations[artic];
  var smuflName = articulationMeta.glyphName;
  var glyphData = Vex.Flow.SMuFLGonvilleMap[smuflName];
  return Vex.Merge(articulationMeta, glyphData);
};

Vex.Flow.articulationCodes.articulations = {
  "a.": {
    glyphName: "articStaccatoAbove",
    between_lines: true
  },
  "av": {
    glyphName: "articStaccatissimoAbove",
    between_lines: true
  },
  "a>": {
    glyphName: "articAccentAbove",
    between_lines: true
  },
  "a-": {
    glyphName: "articTenutoAbove",
    between_lines: true
  },
  "a^": {
    glyphName: "articMarcatoAbove",
    between_lines: false
  },
  "a+": {
    glyphName: "pluckedLeftHandPizzicato",
    between_lines: false
  },
  "ao": {
    glyphName: "pluckedSnapPizzicatoAbove",
    between_lines: false
  },
  "ah": {
    glyphName: "stringsHarmonic",
    between_lines: false
  },
  "a@a": {
    glyphName: "fermataAbove",
    between_lines: false
  },
  "a@u": {
    glyphName: "fermataBelow",
    between_lines: false
  },
  "a|": {
    glyphName: "stringsUpBow",
    between_lines: false
  },
  "am": {
    glyphName: "stringsDownBow",
    between_lines: false
  },
  "a,": {
    glyphName: "breathMarkComma",
    between_lines: false
  }
};

Vex.Flow.accidentalCodes = function(acc) {
  var smufl = Vex.Flow.accidentalCodes.accidentals[acc];
  return Vex.Flow.SMuFLGonvilleMap[smufl];
};

Vex.Flow.accidentalCodes.accidentals = {
  "#": "accidentalSharp",
  "##": "accidentalDoubleSharp",
  "b": "accidentalFlat",
  "bb": "accidentalDoubleFlat",
  "n": "accidentalNatural",
  "{": "accidentalParensLeft",
  "}": "accidentalParensRight",
  "db": "accidentalThreeQuarterTonesFlatZimmermann",
  "d": "accidentalQuarterToneFlatStein",
  "bbs": "bbs",
  "++": "accidentalThreeQuarterTonesSharpStein",
  "+": "accidentalQuarterToneSharpStein"
};

Vex.Flow.ornamentCodes = function(acc) {
  var smufl =  Vex.Flow.ornamentCodes.ornaments[acc];
  return Vex.Flow.SMuFLGonvilleMap[smufl];
};

Vex.Flow.ornamentCodes.ornaments = {
  "mordent": "ornamentMordent",
  "mordent_inverted": "ornamentMordentInverted",
  "turn": "ornamentTurn",
  "turn_inverted": "ornamentTurnSlash",
  "tr": "ornamentTrill",
  "upprall": "ornamentPrecompSlideTrillDAnglebert",
  "downprall": "ornamentPrecompMordentUpperPrefix",
  "prallup": "ornamentPrecompTrillSuffixDandrieu",
  "pralldown": "ornamentPrecompTrillLowerSuffx",
  "upmordent": "ornamentPrecompPortDeVoixMordent",
  "downmordent": "ornamentPrecompInvertedMordentUpperPrefix",
  "lineprall": "ornamentPrecompAppoggTrill",
  "prallprall": "ornamentTremblement"
};

Vex.Flow.keySignature = function(spec) {
  var keySpec = Vex.Flow.keySignature.keySpecs[spec];

  if (!keySpec) {
    throw new Vex.RERR("BadKeySignature",
        "Bad key signature spec: '" + spec + "'");
  }

  if (!keySpec.acc) {
    return [];
  }

  var notes = Vex.Flow.keySignature.accidentalList(keySpec.acc);

  var acc_list = [];
  for (var i = 0; i < keySpec.num; ++i) {
    var line = notes[i];
    acc_list.push({type: keySpec.acc, line: line});
  }

  return acc_list;
};

Vex.Flow.keySignature.keySpecs = {
  "C": {acc: null, num: 0},
  "Am": {acc: null, num: 0},
  "F": {acc: "b", num: 1},
  "Dm": {acc: "b", num: 1},
  "Bb": {acc: "b", num: 2},
  "Gm": {acc: "b", num: 2},
  "Eb": {acc: "b", num: 3},
  "Cm": {acc: "b", num: 3},
  "Ab": {acc: "b", num: 4},
  "Fm": {acc: "b", num: 4},
  "Db": {acc: "b", num: 5},
  "Bbm": {acc: "b", num: 5},
  "Gb": {acc: "b", num: 6},
  "Ebm": {acc: "b", num: 6},
  "Cb": {acc: "b", num: 7},
  "Abm": {acc: "b", num: 7},
  "G": {acc: "#", num: 1},
  "Em": {acc: "#", num: 1},
  "D": {acc: "#", num: 2},
  "Bm": {acc: "#", num: 2},
  "A": {acc: "#", num: 3},
  "F#m": {acc: "#", num: 3},
  "E": {acc: "#", num: 4},
  "C#m": {acc: "#", num: 4},
  "B": {acc: "#", num: 5},
  "G#m": {acc: "#", num: 5},
  "F#": {acc: "#", num: 6},
  "D#m": {acc: "#", num: 6},
  "C#": {acc: "#", num: 7},
  "A#m": {acc: "#", num: 7}
};

Vex.Flow.unicode = {
  // Unicode accidentals
  "sharp": String.fromCharCode(parseInt('266F', 16)),
  "flat" : String.fromCharCode(parseInt('266D', 16)),
  "natural": String.fromCharCode(parseInt('266E', 16)),
  // Major Chord
  "triangle": String.fromCharCode(parseInt('25B3', 16)),
  // half-diminished
  "o-with-slash": String.fromCharCode(parseInt('00F8', 16)),
   // Diminished
  "degrees": String.fromCharCode(parseInt('00B0', 16)),
  "circle": String.fromCharCode(parseInt('25CB', 16))
};

Vex.Flow.keySignature.accidentalList = function(acc) {
  if (acc == "b") {
    return [2, 0.5, 2.5, 1, 3, 1.5, 3.5];
  }
  else if (acc == "#") {
    return [0, 1.5, -0.5, 1, 2.5, 0.5, 2]; }
};

Vex.Flow.parseNoteDurationString = function(durationString) {
  if (typeof(durationString) !== "string") {
    return null;
  }

  var regexp = /(\d*\/?\d+|[a-z])(d*)([nrhms]|$)/;

  var result = regexp.exec(durationString);
  if (!result) {
    return null;
  }

  var duration = result[1];
  var dots = result[2].length;
  var type = result[3];

  if (type.length === 0) {
    type = "n";
  }

  return {
    duration: duration,
    dots: dots,
    type: type
  };
};

Vex.Flow.parseNoteData = function(noteData) {
  var duration = noteData.duration;

  // Preserve backwards-compatibility
  var durationStringData = Vex.Flow.parseNoteDurationString(duration);
  if (!durationStringData) {
    return null;
  }

  var ticks = Vex.Flow.durationToTicks(durationStringData.duration);
  if (ticks == null) {
    return null;
  }

  var type = noteData.type;

  if (type) {
    if (!(type === "n" || type === "r" || type === "h" ||
          type === "m" || type === "s")) {
      return null;
    }
  } else {
    type = durationStringData.type;
    if (!type) {
      type = "n";
    }
  }

  var dots = 0;
  if (noteData.dots) {
    dots = noteData.dots;
  } else {
    dots = durationStringData.dots;
  }

  if (typeof(dots) !== "number") {
    return null;
  }

  var currentTicks = ticks;

  for (var i = 0; i < dots; i++) {
    if (currentTicks <= 1) {
      return null;
    }

    currentTicks = currentTicks / 2;
    ticks += currentTicks;
  }

  return {
    duration: durationStringData.duration,
    type: type,
    dots: dots,
    ticks: ticks
  };
};

// Used to convert duration aliases to the number based duration.
// If the input isn't an alias, simply return the input.
//
// example: 'q' -> '4', '8' -> '8'
function sanitizeDuration(duration) {
  var alias = Vex.Flow.durationAliases[duration];
  if (alias !== undefined) {
    duration = alias;
  }

  if (Vex.Flow.durationToTicks.durations[duration] === undefined) {
    throw new Vex.RERR('BadArguments',
      'The provided duration is not valid');
  }

  return duration;
}

// Convert the `duration` to an fraction
Vex.Flow.durationToFraction = function(duration) {
  return new Vex.Flow.Fraction().parse(sanitizeDuration(duration));
};

// Convert the `duration` to an number
Vex.Flow.durationToNumber = function(duration) {
  return Vex.Flow.durationToFraction(duration).value();
};

// Convert the `duration` to total ticks
Vex.Flow.durationToTicks = function(duration) {
  duration = sanitizeDuration(duration);

  var ticks = Vex.Flow.durationToTicks.durations[duration];
  if (ticks === undefined) {
    return null;
  }

  return ticks;
};

Vex.Flow.durationToTicks.durations = {
  "1/2":  Vex.Flow.RESOLUTION * 2,
  "1":    Vex.Flow.RESOLUTION / 1,
  "2":    Vex.Flow.RESOLUTION / 2,
  "4":    Vex.Flow.RESOLUTION / 4,
  "8":    Vex.Flow.RESOLUTION / 8,
  "16":   Vex.Flow.RESOLUTION / 16,
  "32":   Vex.Flow.RESOLUTION / 32,
  "64":   Vex.Flow.RESOLUTION / 64,
  "128":  Vex.Flow.RESOLUTION / 128,
  "256":  Vex.Flow.RESOLUTION / 256
};

Vex.Flow.durationAliases = {
  "w": "1",
  "h": "2",
  "q": "4",

  // This is the default duration used to render bars (BarNote). Bars no longer
  // consume ticks, so this should be a no-op.
  //
  // TODO(0xfe): This needs to be cleaned up.
  "b": "256"
};

Vex.Flow.durationToGlyph = function(duration, type) {
  var alias = Vex.Flow.durationAliases[duration];
  if (alias !== undefined) {
    duration = alias;
  }

  var data = Vex.Flow.durationToGlyph.duration_codes[duration];
  if (data === undefined) {
    return null;
  }

  if (!type) {
    type = "n";
  }

  var durationTypeProperties = data.type[type];
  if (durationTypeProperties === undefined) {
    return null;
  }

  data = Vex.Merge(Vex.Merge({}, data.common), durationTypeProperties);

  var glyphData = Vex.Flow.SMuFLGonvilleMap[data.glyphName];
  
  return Vex.Merge(data, glyphData);
};

Vex.Flow.durationToGlyph.duration_codes = {
  "1/2": {
    common: {
      stem: false,
      stem_offset: 0,
      flag: false,
      stem_up_extension: -Vex.Flow.STEM_HEIGHT,
      stem_down_extension: -Vex.Flow.STEM_HEIGHT,
      gracenote_stem_up_extension: -Vex.Flow.STEM_HEIGHT,
      gracenote_stem_down_extension: -Vex.Flow.STEM_HEIGHT,
      tabnote_stem_up_extension: -Vex.Flow.STEM_HEIGHT,
      tabnote_stem_down_extension: -Vex.Flow.STEM_HEIGHT,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Breve note
        glyphName: "noteheadDoubleWhole"
      },
      "h": { // Breve note harmonic
        glyphName: "noteheadDiamondDoubleWhole"
      },
      "m": { // Breve note muted -
        glyphName: "noteheadXDoubleWhole",
        stem_offset: 0
      },
      "r": { // Breve rest
        glyphName: "restDoubleWhole",
        rest: true,
        position: "B/5",
        dot_shiftY: 0.5
      },
      "s": { // Breve note slash -
        glyphName: "noteheadSlashDoubleWhole",
        position: "B/4"
      }
    }
  },
  "1": {
    common: {
      stem: false,
      flag: false,
      stem_up_extension: -Vex.Flow.STEM_HEIGHT,
      stem_down_extension: -Vex.Flow.STEM_HEIGHT,
      gracenote_stem_up_extension: -Vex.Flow.STEM_HEIGHT,
      gracenote_stem_down_extension: -Vex.Flow.STEM_HEIGHT,
      tabnote_stem_up_extension: -Vex.Flow.STEM_HEIGHT,
      tabnote_stem_down_extension: -Vex.Flow.STEM_HEIGHT,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Whole note
        glyphName: "noteheadWhole"
      },
      "h": { // Whole note harmonic
        glyphName: "noteheadDiamondWhole"
      },
      "m": { // Whole note muted
        glyphName: "noteheadXWhole",
      },
      "r": { // Whole rest
        glyphName: "restWhole",
        rest: true,
        position: "D/5",
        dot_shiftY: 0.5
      },
      "s": { // Whole note slash
        // Drawn with canvas primitives
        glyphName: "noteheadSlashWhiteWhole",
        position: "B/4"
      }
    }
  },
  "2": {
    common: {
      stem: true,
      stem_offset: 0,
      flag: false,
      stem_up_extension: 0,
      stem_down_extension: 0,
      gracenote_stem_up_extension: -14,
      gracenote_stem_down_extension: -14,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Half note
        glyphName: "noteheadHalf"
      },
      "h": { // Half note harmonic
        glyphName: "noteheadDiamondHalf"
      },
      "m": { // Half note muted
        glyphName: "noteheadXHalf",
      },
      "r": { // Half rest
        glyphName: "restHalf",
        stem: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5
      },
      "s": { // Half note slash
        // Drawn with canvas primitives
        glyphName: "noteheadSlashWhiteHalf",
        position: "B/4"
      }
    }
  },
  "4": {
    common: {
      stem: true,
      stem_offset: 0,
      flag: false,
      stem_up_extension: 0,
      stem_down_extension: 0,
      gracenote_stem_up_extension: -14,
      gracenote_stem_down_extension: -14,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Quarter note
        glyphName: "noteheadBlack"
      },
      "h": { // Quarter harmonic
        glyphName: "noteheadDiamondBlack"
      },
      "m": { // Quarter muted
        glyphName: "noteheadXBlack",
      },
      "r": { // Quarter rest
        glyphName: "restQuarter",
        stem: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5,
        line_above: 1.5,
        line_below: 1.5
      },
      "s": { // Quarter slash
        glyphName: "noteheadSlashHorizontalEnds",
        position: "B/4"
      }
    }
  },
  "8": {
    common: {
      stem: true,
      stem_offset: 0,
      flag: true,
      beam_count: 1,
      code_flag_upstem: "flag8thUp",
      code_flag_downstem: "flag8thDown",
      stem_up_extension: 0,
      stem_down_extension: 0,
      gracenote_stem_up_extension: -14,
      gracenote_stem_down_extension: -14,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Eighth note
        glyphName: "noteheadBlack"
      },
      "h": { // Eighth note harmonic
        glyphName: "noteheadDiamondBlack"
      },
      "m": { // Eighth note muted
        glyphName: "noteheadXBlack"
      },
      "r": { // Eighth rest
        glyphName: "rest8th",
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 1.0
      },
      "s": { // Eight slash
        glyphName: "noteheadSlashHorizontalEnds",
        position: "B/4"
      }
    }
  },
  "16": {
    common: {
      beam_count: 2,
      stem: true,
      stem_offset: 0,
      flag: true,
      code_flag_upstem: "flag16thUp",
      code_flag_downstem: "flag16thDown",
      stem_up_extension: 4,
      stem_down_extension: 0,
      gracenote_stem_up_extension: -14,
      gracenote_stem_down_extension: -14,
      tabnote_stem_up_extension: 0,
      tabnote_stem_down_extension: 0,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Sixteenth note
        glyphName: "noteheadBlack"
      },
      "h": { // Sixteenth note harmonic
        glyphName: "noteheadDiamondBlack"
      },
      "m": { // Sixteenth note muted
        glyphName: "noteheadXBlack"
      },
      "r": { // Sixteenth rest
        glyphName: "rest16th",
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -0.5,
        line_above: 1.0,
        line_below: 2.0
      },
      "s": { // Sixteenth slash
        glyphName: "noteheadSlashHorizontalEnds",
        position: "B/4"
      }
    }
  },
  "32": {
    common: {
      beam_count: 3,
      stem: true,
      flag: true,
      code_flag_upstem: "flag32ndUp",
      code_flag_downstem: "flag32ndDown",
      stem_up_extension: 13,
      stem_down_extension: 9,
      gracenote_stem_up_extension: -12,
      gracenote_stem_down_extension: -12,
      tabnote_stem_up_extension: 9,
      tabnote_stem_down_extension: 5,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Thirty-second note
        glyphName: "noteheadBlack"
      },
      "h": { // Thirty-second harmonic
        glyphName: "noteheadDiamondBlack"
      },
      "m": { // Thirty-second muted
        glyphName: "noteheadXBlack"
      },
      "r": { // Thirty-second rest
        glyphName: "rest32nd",
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 2.0
      },
      "s": { // Thirty-second slash
        glyphName: "noteheadSlashHorizontalEnds",
        position: "B/4"
      }
    }
  },
  "64": {
    common: {
      beam_count: 4,
      stem: true,
      flag: true,
      code_flag_upstem: "flag64thUp",
      code_flag_downstem: "flag64thDown",
      stem_up_extension: 17,
      stem_down_extension: 13,
      gracenote_stem_up_extension: -10,
      gracenote_stem_down_extension: -10,
      tabnote_stem_up_extension: 13,
      tabnote_stem_down_extension: 9,
      dot_shiftY: 0,
      line_above: 0,
      line_below: 0
    },
    type: {
      "n": { // Sixty-fourth note
        glyphName: "noteheadBlack"
      },
      "h": { // Sixty-fourth harmonic
        glyphName: "noteheadDiamondBlack"
      },
      "m": { // Sixty-fourth muted
        glyphName: "noteheadXBlack"
      },
      "r": { // Sixty-fourth rest
        glyphName: "rest64th",
        stem: false,
        flag: false,
        rest: true,
        position: "B/4",
        dot_shiftY: -1.5,
        line_above: 2.0,
        line_below: 3.0
      },
      "s": { // Sixty-fourth slash
        glyphName: "noteheadSlashHorizontalEnds",
        position: "B/4"
      }
    }
  },
  "128": {
      common: {
          beam_count: 5,
          stem: true,
          stem_offset:0,
          flag: true,
          code_flag_upstem: "flag128thUp",
          code_flag_downstem: "flag128thDown",
          stem_up_extension: 26,
          stem_down_extension: 22,
          gracenote_stem_up_extension: -8,
          gracenote_stem_down_extension: -8,
          tabnote_stem_up_extension: 22,
          tabnote_stem_down_extension: 18,
          dot_shiftY: 0,
          line_above: 0,
          line_below: 0
      },
      type: {
          "n": {  // Hundred-twenty-eight note
              glyphName: "noteheadBlack"
          },
          "h": { // Hundred-twenty-eight harmonic
              glyphName: "noteheadDiamondBlack"
          },
          "m": { // Hundred-twenty-eight muted
              glyphName: "noteheadXBlack"
          },
          "r": {  // Hundred-twenty-eight rest
              glyphName: "rest128th",
              stem: false,
              flag: false,
              rest: true,
              position: "B/4",
              dot_shiftY: 1.5,
              line_above: 3.0,
              line_below: 3.0
          },
          "s": { // Hundred-twenty-eight rest
            glyphName: "noteheadSlashHorizontalEnds",
            position: "B/4"
          }
      }
  }
};

// Some defaults
Vex.Flow.TIME4_4 = {
  num_beats: 4,
  beat_value: 4,
  resolution: Vex.Flow.RESOLUTION
};
