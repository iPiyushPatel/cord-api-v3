import { registerEnumType } from 'type-graphql';

export enum BibleBook {
  Genesis = 'gen',
  Exodus = 'exo',
  Leviticus = 'lev',
  Numbers = 'num',
  Deuteronomy = 'deu',
  Joshua = 'jos',
  Judges = 'jdg',
  Ruth = 'rut',
  FirstSamuel = '1sa',
  SecondSamuel = '2sa',
  FirstKings = '1ki',
  SecondKings = '2ki',
  FirstChronicles = '1ch',
  SecondChronicles = '2ch',
  Ezra = 'ezr',
  Nehemiah = 'neh',
  Esther = 'est',
  Job = 'job',
  Psalms = 'psa',
  Proverbs = 'pro',
  Ecclesiastes = 'ecc',
  SongOfSolomon = 'sng',
  Isaiah = 'isa',
  Jeremiah = 'jer',
  Lamentations = 'lam',
  Ezekiel = 'ezk',
  Daniel = 'dan',
  Hosea = 'hos',
  Joel = 'jol',
  Amos = 'amo',
  Obadiah = 'oba',
  Jonah = 'jon',
  Micah = 'mic',
  Nahum = 'nam',
  Habakkuk = 'hab',
  Zephaniah = 'zep',
  Haggai = 'hag',
  Zechariah = 'zec',
  Malachi = 'mal',

  Matthew = 'mat',
  Mark = 'mrk',
  Luke = 'luk',
  John = 'jhn',
  Acts = 'act',
  Romans = 'rom',
  FirstCorinthians = '1co',
  SecondCorinthians = '2co',
  Galatians = 'gal',
  Ephesians = 'eph',
  Philippians = 'php',
  Colossians = 'col',
  FirstThessalonians = '1th',
  SecondThessalonians = '2th',
  FirstTimothy = '1ti',
  SecondTimothy = '2ti',
  Titus = 'tit',
  Philemon = 'phm',
  Hebrews = 'heb',
  James = 'jas',
  FirstPeter = '1pe',
  SecondPeter = '2pe',
  FirstJohn = '1jn',
  SecondJohn = '2jn',
  ThirdJohn = '3jn',
  Jude = 'jud',
  Revelation = 'rev',
}

registerEnumType(BibleBook, {
  name: 'BibleBook',
});
