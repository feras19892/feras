import type { HelpBlock, HelpSection } from '../shared/experiment-help-types';

type Locale = 'ar' | 'en' | 'es';

type SectionContent = {
  p: string;
  list?: string[];
};

type TopicContent = {
  about: SectionContent;
  explore: SectionContent;
  use: string[];
  matter: SectionContent;
};

const sectionNames: Record<
  Locale,
  { about: string; explore: string; use: string; matter: string }
> = {
  ar: {
    about: 'عن هذه التجربة',
    explore: 'ما ستستكشفه',
    use: 'طريقة العمل',
    matter: 'أهميتها',
  },
  en: {
    about: 'What this experiment is about',
    explore: 'What you will explore',
    use: 'How to use the experiment',
    matter: 'Why it matters',
  },
  es: {
    about: 'En qué consiste el experimento',
    explore: 'Lo que explorarás',
    use: 'Cómo usar el experimento',
    matter: 'Por qué es importante',
  },
};

function blockP(text: string): HelpBlock {
  return { type: 'p', text };
}

function blockList(items: string[]): HelpBlock {
  return { type: 'list', items };
}

function blockOrdered(items: string[]): HelpBlock {
  return { type: 'ordered', items };
}

function buildSection(title: string, content: SectionContent): HelpSection {
  const blocks: HelpBlock[] = [blockP(content.p)];
  if (content.list && content.list.length > 0) {
    blocks.push(blockList(content.list));
  }
  return { title, blocks };
}

function buildTopicSections(locale: Locale, content: TopicContent): HelpSection[] {
  const names = sectionNames[locale];
  return [
    buildSection(names.about, content.about),
    buildSection(names.explore, content.explore),
    {
      title: names.use,
      blocks: [blockOrdered(content.use)],
    },
    buildSection(names.matter, content.matter),
  ];
}

const topics: Record<string, Record<Locale, TopicContent>> = {
  heart: {
    ar: {
      about: {
        p: 'القلب عضو عضلي يضخ الدم إلى جميع أجزاء الجسم. يحتوي على أربع حجرات وصمامات تحافظ على تدفق الدم في اتجاه واحد.',
        list: ['مضخة عضلية', 'أربع حجرات', 'صمامات تمنع الرجوع', 'تسليم الأكسجين'],
      },
      explore: {
        p: 'سوف تكتشف الهياكل الرئيسية للقلب وكيفية مرور الدم خلاله.',
        list: ['الأذينان', 'البطينان', 'الصمامات', 'الأوعية الدموية الكبيرة'],
      },
      use: [
        'انقر على جزء من القلب لتحديده.',
        'استخدم الأشعة السينية للنظر إلى الداخل.',
        'استخدم المقطع العرضي لرؤية الطبقات.',
        'اقرأ بطاقة المعلومات لكل جزء.',
      ],
      matter: {
        p: 'فهم القلب يساعدنا على معرفة كيف يصل الأكسجين والغذاء إلى كل خلية. كما أنه يفسر أمراض القلب وعادات الحياة الصحية.',
        list: ['يضخ الدم', 'ينقل الأكسجين', 'يزيل الفضلات', 'يدعم الحياة'],
      },
    },
    en: {
      about: {
        p: 'The heart is a muscular organ that pumps blood through the body. It has four chambers and valves that keep blood flowing in one direction.',
        list: ['muscular pump', 'four chambers', 'valves prevent backflow', 'oxygen delivery'],
      },
      explore: {
        p: 'You will explore the main structures of the heart and how blood moves through it.',
        list: ['atria', 'ventricles', 'valves', 'major blood vessels'],
      },
      use: [
        'Click a heart part to highlight it.',
        'Use x-ray to see inside.',
        'Use cross-section to view layers.',
        'Read the info card for each part.',
      ],
      matter: {
        p: 'Understanding the heart helps us learn how oxygen and nutrients reach every cell. It also explains heart diseases and healthy habits.',
        list: ['pumps blood', 'delivers oxygen', 'removes waste', 'supports life'],
      },
    },
    es: {
      about: {
        p: 'El corazón es un órgano muscular que bombea sangre por todo el cuerpo. Tiene cuatro cámaras y válvulas que mantienen el flujo sanguíneo en una sola dirección.',
        list: ['bomba muscular', 'cuatro cámaras', 'válvulas evitan el retroceso', 'transporte de oxígeno'],
      },
      explore: {
        p: 'Explorarás las principales estructuras del corazón y cómo la sangre lo atraviesa.',
        list: ['aurículas', 'ventrículos', 'válvulas', 'vasos sanguíneos principales'],
      },
      use: [
        'Haz clic en una parte del corazón para resaltarla.',
        'Usa el modo de rayos X para ver el interior.',
        'Usa el corte para ver las capas.',
        'Lee la tarjeta de información de cada parte.',
      ],
      matter: {
        p: 'Entender el corazón nos ayuda a saber cómo el oxígeno y los nutrientes llegan a cada célula. También explica enfermedades cardíacas y hábitos saludables.',
        list: ['bombea sangre', 'transporta oxígeno', 'elimina desechos', 'mantiene la vida'],
      },
    },
  },

  lungs: {
    ar: {
      about: {
        p: 'الرئتان هما العضوان الرئيسيان للتنفس. تقومان بتبادل الأكسجين وثاني أكسيد الكربون بين الهواء والدم.',
        list: ['تبادل الغازات', 'الشعب الهوائية والحويصلات', 'أكسجين داخل وثاني أكسيد كربون خارج', 'الحجاب الحاجز يساعد على التنفس'],
      },
      explore: {
        p: 'سوف تنظر إلى أجزاء الجهاز التنفسي وكيفية حدوث تبادل الغازات.',
        list: ['القصبة الهوائية', 'الشعب الهوائية', 'القصيبات الهوائية', 'الحويصلات الهوائية'],
      },
      use: [
        'حدد جزءًا من الرئة.',
        'أدر النموذج.',
        'شغّل الأشعة السينية لرؤية المسالك الهوائية.',
        'اقرأ وصف كل جزء.',
      ],
      matter: {
        p: 'الرئتان الصحيتان ضروريتان لإيصال الأكسجين إلى الدم وإخراج ثاني أكسيد الكربون. التدخين والتلوث يمكن أن يلحقا بهما ضررًا.',
        list: ['تستقبلان الأكسجين', 'تطرحان ثاني أكسيد الكربون', 'تدعمان الطاقة', 'تحميان بالمخاط'],
      },
    },
    en: {
      about: {
        p: 'The lungs are the main organs of breathing. They exchange oxygen and carbon dioxide between the air and the blood.',
        list: ['gas exchange', 'bronchi and alveoli', 'oxygen in, carbon dioxide out', 'diaphragm helps breathing'],
      },
      explore: {
        p: 'You will look at the parts of the respiratory system and how gas exchange happens.',
        list: ['trachea', 'bronchi', 'bronchioles', 'alveoli'],
      },
      use: [
        'Select a lung structure.',
        'Rotate the model.',
        'Turn on x-ray to see airways.',
        'Read the description of each part.',
      ],
      matter: {
        p: 'Healthy lungs are essential for getting oxygen into the blood and removing carbon dioxide. Smoking and pollution can damage them.',
        list: ['take in oxygen', 'release carbon dioxide', 'support energy', 'protect with mucus'],
      },
    },
    es: {
      about: {
        p: 'Los pulmones son los órganos principales de la respiración. Intercambian oxígeno y dióxido de carbono entre el aire y la sangre.',
        list: ['intercambio de gases', 'bronquios y alvéolos', 'oxígeno entra y dióxido sale', 'el diafragma ayuda a respirar'],
      },
      explore: {
        p: 'Verás las partes del sistema respiratorio y cómo ocurre el intercambio de gases.',
        list: ['tráquea', 'bronquios', 'bronquiolos', 'alvéolos'],
      },
      use: [
        'Selecciona una estructura pulmonar.',
        'Gira el modelo.',
        'Activa los rayos X para ver las vías respiratorias.',
        'Lee la descripción de cada parte.',
      ],
      matter: {
        p: 'Los pulmones sanos son esenciales para llevar oxígeno a la sangre y eliminar el dióxido de carbono. El tabaco y la contaminación pueden dañarlos.',
        list: ['absorben oxígeno', 'liberan dióxido de carbono', 'dan energía', 'se protegen con mucosidad'],
      },
    },
  },

  skeleton: {
    ar: {
      about: {
        p: 'الهيكل العظمي مكوّن من عظام تدعم الجسم، تحمي الأعضاء، وتسمح بالحركة. يحتوي جسم البالغ عادةً على 206 عظام.',
        list: ['206 عظام في البالغين', 'الدعم والحماية', 'تخزين المعادن', 'العمل مع العضلات'],
      },
      explore: {
        p: 'سوف تكتشف العظام والمفاصل الرئيسية وتتعلم وظيفة كل منها.',
        list: ['الجمجمة', 'القفص الصدري', 'العمود الفقري', 'الأطراف'],
      },
      use: [
        'انقر على عظمة لتحديدها.',
        'استخدم التفكيك لفصل الأجزاء.',
        'اقرأ الحقائق.',
        'أعد تعيين النموذج.',
      ],
      matter: {
        p: 'العظام تخزن المعادن، وتصنع خلايا الدم، وتعمل مع العضلات لتسمح لنا بالحركة.',
        list: ['تدعم الجسم', 'تحمي الأعضاء', 'تمكن الحركة', 'تخزن الكالسيوم'],
      },
    },
    en: {
      about: {
        p: 'The skeleton is made of bones that support the body, protect organs, and allow movement. Adults usually have 206 bones.',
        list: ['206 bones in adults', 'supports and protects', 'stores minerals', 'works with muscles'],
      },
      explore: {
        p: 'You will explore major bones and joints and learn what each one does.',
        list: ['skull', 'rib cage', 'spine', 'limbs'],
      },
      use: [
        'Click a bone to highlight it.',
        'Use explode to separate parts.',
        'Read facts.',
        'Reset the model.',
      ],
      matter: {
        p: 'Bones store minerals, make blood cells, and work with muscles so we can move.',
        list: ['support body', 'protect organs', 'make movement', 'store calcium'],
      },
    },
    es: {
      about: {
        p: 'El esqueleto está formado por huesos que sostienen el cuerpo, protegen órganos y permiten el movimiento. Los adultos suelen tener 206 huesos.',
        list: ['206 huesos en adultos', 'sostiene y protege', 'almacena minerales', 'trabaja con músculos'],
      },
      explore: {
        p: 'Explorarás los huesos y articulaciones principales y aprenderás la función de cada uno.',
        list: ['cráneo', 'caja torácica', 'columna vertebral', 'extremidades'],
      },
      use: [
        'Haz clic en un hueso para resaltarlo.',
        'Usa la función de separación para ver las partes.',
        'Lee los datos.',
        'Restablece el modelo.',
      ],
      matter: {
        p: 'Los huesos almacenan minerales, producen células sanguíneas y trabajan con los músculos para que podamos movernos.',
        list: ['sostienen el cuerpo', 'protegen órganos', 'permiten movimiento', 'almacenan calcio'],
      },
    },
  },

  digestive: {
    ar: {
      about: {
        p: 'الجهاز الهضمي يحول الطعام إلى مغذيات يمكن للجسم استخدامها. يشمل أنبوبًا طويلًا وأعضاء مساعدة.',
        list: ['يحلل الطعام', 'يمتص المغذيات', 'من الفم إلى الأمعاء', 'الكبد يفرز الصفراء'],
      },
      explore: {
        p: 'سوف تتبع الطعام عبر أعضاء الهضم الرئيسية.',
        list: ['الفم', 'المريء', 'المعدة', 'الأمعاء الدقيقة', 'الأمعاء الغليظة', 'الكبد'],
      },
      use: [
        'حدد عضوًا هضميًا.',
        'اقرأ كيف يعمل.',
        'استخدم المقطع العرضي لرؤية الداخل.',
        'قارن بين الأعضاء.',
      ],
      matter: {
        p: 'الهضم يمد الجسم بالطاقة ومواد البناء. النظام الغذائي الصحي يبقي الجهاز يعمل بشكل جيد.',
        list: ['يفتت الطعام', 'يمتص المغذيات', 'يطرح الفضلات', 'يوفر الطاقة'],
      },
    },
    en: {
      about: {
        p: 'The digestive system breaks food into nutrients the body can use. It includes a long tube and helper organs.',
        list: ['breaks down food', 'absorbs nutrients', 'mouth to intestines', 'liver makes bile'],
      },
      explore: {
        p: 'You will follow food through the main organs of digestion.',
        list: ['mouth', 'esophagus', 'stomach', 'small intestine', 'large intestine', 'liver'],
      },
      use: [
        'Select a digestive organ.',
        'Read how it works.',
        'Use cross-section to see inside.',
        'Compare organs.',
      ],
      matter: {
        p: 'Digestion gives the body energy and building materials. A healthy diet keeps the system working well.',
        list: ['breaks down food', 'absorbs nutrients', 'removes waste', 'provides energy'],
      },
    },
    es: {
      about: {
        p: 'El sistema digestivo descompone los alimentos en nutrientes que el cuerpo puede usar. Incluye un tubo largo y órganos auxiliares.',
        list: ['descompone alimentos', 'absorbe nutrientes', 'boca a intestinos', 'hígado produce bilis'],
      },
      explore: {
        p: 'Seguirás los alimentos a través de los órganos principales de la digestión.',
        list: ['boca', 'esófago', 'estómago', 'intestino delgado', 'intestino grueso', 'hígado'],
      },
      use: [
        'Selecciona un órgano digestivo.',
        'Lee cómo funciona.',
        'Usa el corte para ver su interior.',
        'Compara los órganos.',
      ],
      matter: {
        p: 'La digestión da energía y materiales de construcción al cuerpo. Una dieta saludable mantiene el sistema en buen estado.',
        list: ['descompone alimentos', 'absorbe nutrientes', 'elimina desechos', 'da energía'],
      },
    },
  },

  kidney: {
    ar: {
      about: {
        p: 'الكليتان ترشّحان الدم لإزالة الفضلات والماء الزائد، مكونتين البول. كما تساعدان على الحفاظ على توازن الجسم.',
        list: ['ترشيح الدم', 'تكوين البول', 'تحتوي على النفرونات', 'توازن الماء والأملاح'],
      },
      explore: {
        p: 'سوف تكتشف الكلية ووحدات الترشيح الصغيرة فيها.',
        list: ['القشرة', 'اللب', 'النفرونات', 'الحالب'],
      },
      use: [
        'انقر على الكلية لرؤية طبقاتها.',
        'استخدم الأشعة السينية لرؤية النفرونات.',
        'اقرأ عن عملية الترشيح.',
        'أعد التعيين.',
      ],
      matter: {
        p: 'الكليتان تسيطران على ضغط الدم، وتنظفان الدم، وتحافظان على مستويات الملح والماء ثابتة.',
        list: ['ترشحان الدم', 'تزيلان الفضلات', 'تضبطان الماء', 'توازنان الأملاح'],
      },
    },
    en: {
      about: {
        p: 'The kidneys filter blood to remove waste and extra water, making urine. They help keep the body balanced.',
        list: ['filters blood', 'makes urine', 'contains nephrons', 'balances water and salts'],
      },
      explore: {
        p: 'You will explore the kidney and its tiny filtering units.',
        list: ['cortex', 'medulla', 'nephrons', 'ureter'],
      },
      use: [
        'Click the kidney to see layers.',
        'Use x-ray to view nephrons.',
        'Read about filtration.',
        'Reset.',
      ],
      matter: {
        p: 'Kidneys control blood pressure, clean the blood, and keep salt and water levels steady.',
        list: ['filter blood', 'remove waste', 'control water', 'balance salts'],
      },
    },
    es: {
      about: {
        p: 'Los riñones filtran la sangre para eliminar desechos y agua extra, formando la orina. Ayudan a mantener el cuerpo equilibrado.',
        list: ['filtran sangre', 'producen orina', 'contienen nefronas', 'equilibran agua y sales'],
      },
      explore: {
        p: 'Explorarás el riñón y sus pequeñas unidades de filtración.',
        list: ['corteza', 'médula', 'nefronas', 'uréter'],
      },
      use: [
        'Haz clic en el riñón para ver sus capas.',
        'Usa los rayos X para ver las nefronas.',
        'Lee sobre la filtración.',
        'Restablece el modelo.',
      ],
      matter: {
        p: 'Los riñones controlan la presión arterial, limpian la sangre y mantienen estables los niveles de sal y agua.',
        list: ['filtran la sangre', 'eliminan desechos', 'controlan el agua', 'equilibran sales'],
      },
    },
  },

  eye: {
    ar: {
      about: {
        p: 'العين تحول الضوء إلى إشارات يمكن للدماغ فهمها. تحتوي على أجزاء شفافة تركز الضوء وتكتشفه.',
        list: ['تركيز الضوء', 'الشبكية تكتشف الصور', 'العصب البصري يرسل إشارات', 'القرنية والعدسة'],
      },
      explore: {
        p: 'سوف تكتشف الأجزاء التي تساعدك على الرؤية.',
        list: ['القرنية', 'العدسة', 'الشبكية', 'العصب البصري'],
      },
      use: [
        'حدد جزءًا من العين.',
        'استخدم المقطع العرضي لرؤية الداخل.',
        'افهم فكرة التركيز.',
        'اقرأ بطاقة المعلومات.',
      ],
      matter: {
        p: 'الرؤية تساعد الحيوانات على إيجاد الطعام، وتجنب الخطر، والتعلم عن العالم.',
        list: ['تركز الضوء', 'تكتشف الصور', 'ترسل إشارات إلى الدماغ', 'تحمي بالدموع'],
      },
    },
    en: {
      about: {
        p: 'The eye turns light into signals the brain can understand. It has clear parts that focus and detect light.',
        list: ['focuses light', 'retina detects images', 'optic nerve sends signals', 'cornea and lens'],
      },
      explore: {
        p: 'You will explore the parts that help you see.',
        list: ['cornea', 'lens', 'retina', 'optic nerve'],
      },
      use: [
        'Select an eye part.',
        'Use cross-section to see inside.',
        'Adjust focus ideas.',
        'Read the info card.',
      ],
      matter: {
        p: 'Vision helps animals find food, avoid danger, and learn about the world.',
        list: ['focuses light', 'detects images', 'sends signals to brain', 'protects with tears'],
      },
    },
    es: {
      about: {
        p: 'El ojo convierte la luz en señales que el cerebro puede entender. Tiene partes transparentes que enfocan y detectan la luz.',
        list: ['enfoca la luz', 'retina detecta imágenes', 'nervio óptico envía señales', 'córnea y cristalino'],
      },
      explore: {
        p: 'Explorarás las partes que te permiten ver.',
        list: ['córnea', 'cristalino', 'retina', 'nervio óptico'],
      },
      use: [
        'Selecciona una parte del ojo.',
        'Usa el corte para ver el interior.',
        'Ajusta el concepto de enfoque.',
        'Lee la tarjeta de información.',
      ],
      matter: {
        p: 'La visión ayuda a los animales a encontrar comida, evitar peligros y aprender sobre el mundo.',
        list: ['enfoca la luz', 'detecta imágenes', 'envía señales al cerebro', 'se protege con lágrimas'],
      },
    },
  },

  'animal-cell': {
    ar: {
      about: {
        p: 'الخلايا الحيوانية هي الوحدات الأساسية للحيوانات. تحتوي على عضيات صغيرة كثيرة تقوم بعمليات الحياة.',
        list: ['لا جدار خلوي', 'تحتوي على نواة', 'الميتوكوندريا تنتج الطاقة', 'الريبوسومات تبني البروتينات'],
      },
      explore: {
        p: 'سوف تكتشف العضيات الرئيسية داخل الخلية الحيوانية.',
        list: ['النواة', 'الميتوكوندريا', 'الغشاء الخلوي', 'السيتوبلازم', 'الريبوسومات', 'الجسيمات الحالة'],
      },
      use: [
        'حدد عضية.',
        'أدر الخلية.',
        'استخدم الأشعة السينية لرؤية الأجزاء المخفية.',
        'اقرأ الحقائق.',
      ],
      matter: {
        p: 'معرفة كيفية عمل الخلايا الحيوانية تساعدنا على فهم النمو والشفاء والأمراض.',
        list: ['تتحكم في النشاط', 'تنتج الطاقة', 'تبني البروتينات', 'تزيل الفضلات'],
      },
    },
    en: {
      about: {
        p: 'Animal cells are the basic units of animals. They contain many small organelles that carry out life processes.',
        list: ['no cell wall', 'has a nucleus', 'mitochondria make energy', 'ribosomes build proteins'],
      },
      explore: {
        p: 'You will explore the main organelles inside an animal cell.',
        list: ['nucleus', 'mitochondria', 'cell membrane', 'cytoplasm', 'ribosomes', 'lysosomes'],
      },
      use: [
        'Select an organelle.',
        'Rotate the cell.',
        'Use x-ray to see hidden parts.',
        'Read the facts.',
      ],
      matter: {
        p: 'Knowing how animal cells work helps us understand growth, healing, and disease.',
        list: ['controls activity', 'makes energy', 'builds proteins', 'removes waste'],
      },
    },
    es: {
      about: {
        p: 'Las células animales son las unidades básicas de los animales. Contienen muchos organelos que realizan los procesos de la vida.',
        list: ['sin pared celular', 'tiene núcleo', 'mitocondrias producen energía', 'ribosomas construyen proteínas'],
      },
      explore: {
        p: 'Explorarás los organelos principales dentro de una célula animal.',
        list: ['núcleo', 'mitocondrias', 'membrana celular', 'citoplasma', 'ribosomas', 'lisosomas'],
      },
      use: [
        'Selecciona un organelo.',
        'Gira la célula.',
        'Activa los rayos X para ver partes ocultas.',
        'Lee los datos.',
      ],
      matter: {
        p: 'Saber cómo funcionan las células animales nos ayuda a entender el crecimiento, la curación y las enfermedades.',
        list: ['controlan la actividad', 'producen energía', 'construyen proteínas', 'eliminan desechos'],
      },
    },
  },

  'plant-cell': {
    ar: {
      about: {
        p: 'الخلايا النباتية تمتلك جدارًا خلويًا قويًا وبلاستيدات خضراء تصنع الغذاء من ضوء الشمس. تحتوي أيضًا على فراغ كبير.',
        list: ['الجدار الخلوي يدعمها', 'البلاستيدات الخضراء تصنع الغذاء', 'فراغ مركزي كبير', 'تحتوي على نواة'],
      },
      explore: {
        p: 'سوف ترى الأجزاء التي تميز الخلايا النباتية عن الحيوانية.',
        list: ['الجدار الخلوي', 'البلاستيدات الخضراء', 'الفراغ الكبير', 'النواة', 'الميتوكوندريا'],
      },
      use: [
        'حدد جزءًا من الخلية النباتية.',
        'قارنه بالخلية الحيوانية.',
        'استخدم الأشعة السينية.',
        'اقرأ الأوصاف.',
      ],
      matter: {
        p: 'الخلايا النباتية تنتج الأكسجين والغذاء لمعظم الكائنات الحية على الأرض.',
        list: ['تصنع الجلوكوز', 'تطلق الأكسجين', 'تخزن الماء', 'تدعم النبتة'],
      },
    },
    en: {
      about: {
        p: 'Plant cells have a strong cell wall and chloroplasts that make food from sunlight. They also have a large vacuole.',
        list: ['cell wall supports it', 'chloroplasts make food', 'large central vacuole', 'has a nucleus'],
      },
      explore: {
        p: 'You will see the parts that make plant cells different from animal cells.',
        list: ['cell wall', 'chloroplasts', 'large vacuole', 'nucleus', 'mitochondria'],
      },
      use: [
        'Select a plant cell part.',
        'Compare it with an animal cell.',
        'Use x-ray.',
        'Read the descriptions.',
      ],
      matter: {
        p: 'Plant cells produce oxygen and food for most life on Earth.',
        list: ['make glucose', 'release oxygen', 'store water', 'support the plant'],
      },
    },
    es: {
      about: {
        p: 'Las células vegetales tienen una pared celular fuerte y cloroplastos que producen alimento a partir de la luz solar. También tienen una vacuola grande.',
        list: ['la pared celular las sostiene', 'cloroplastos producen alimento', 'vacuola central grande', 'tiene núcleo'],
      },
      explore: {
        p: 'Verás las partes que hacen diferentes a las células vegetales de las animales.',
        list: ['pared celular', 'cloroplastos', 'vacuola grande', 'núcleo', 'mitocondrias'],
      },
      use: [
        'Selecciona una parte de la célula vegetal.',
        'Compárala con una célula animal.',
        'Activa los rayos X.',
        'Lee las descripciones.',
      ],
      matter: {
        p: 'Las células vegetales producen oxígeno y alimento para la mayoría de los seres vivos de la Tierra.',
        list: ['producen glucosa', 'liberan oxígeno', 'almacenan agua', 'sostienen la planta'],
      },
    },
  },

  'dna-structure': {
    ar: {
      about: {
        p: 'الحمض النووي DNA هو جزيء طويل يخزن المعلومات الوراثية. شكله لولب مزدوج مكون من قواعد مرتبطة.',
        list: ['لولب مزدوج', 'قواعد النيوكليوتيدات', 'عمود فقري من السكر والفوسفات', 'يخزن الشفرة الوراثية'],
      },
      explore: {
        p: 'سوف تكتشف الوحدات البنائية وشكل الحمض النووي.',
        list: ['العمود الفقري من السكر والفوسفات', 'القواعد A-T و C-G', 'اللولب المزدوج', 'الجينات'],
      },
      use: [
        'أدر نموذج الحمض النووي.',
        'كبّر على أزواج القواعد.',
        'اقرأ التسميات.',
        'قارن السلسلتين.',
      ],
      matter: {
        p: 'الحمض النووي يحمل التعليمات اللازمة لبناء وتشغيل كل كائن حي.',
        list: ['يخزن الصفات', 'يرشد النمو', 'ينقل المعلومات', 'يسمح بالتكاثر'],
      },
    },
    en: {
      about: {
        p: 'DNA is a long molecule that stores genetic information. Its shape is a double helix made of paired bases.',
        list: ['double helix', 'nucleotide bases', 'sugar-phosphate backbone', 'stores genetic code'],
      },
      explore: {
        p: 'You will explore the building blocks and shape of DNA.',
        list: ['sugar-phosphate backbone', 'bases A-T and C-G', 'double helix', 'genes'],
      },
      use: [
        'Rotate the DNA model.',
        'Zoom on base pairs.',
        'Read the labels.',
        'Compare the strands.',
      ],
      matter: {
        p: 'DNA holds the instructions for building and running every living thing.',
        list: ['stores traits', 'guides growth', 'passes information', 'allows reproduction'],
      },
    },
    es: {
      about: {
        p: 'El ADN es una molécula larga que almacena la información genética. Su forma es una doble hélice formada por bases pareadas.',
        list: ['doble hélice', 'bases de nucleótidos', 'esqueleto de azúcar-fosfato', 'almacena el código genético'],
      },
      explore: {
        p: 'Explorarás los bloques constructivos y la forma del ADN.',
        list: ['esqueleto de azúcar-fosfato', 'bases A-T y C-G', 'doble hélice', 'genes'],
      },
      use: [
        'Gira el modelo de ADN.',
        'Haz zoom sobre los pares de bases.',
        'Lee las etiquetas.',
        'Compara las cadenas.',
      ],
      matter: {
        p: 'El ADN contiene las instrucciones para construir y hacer funcionar a todo ser vivo.',
        list: ['almacena rasgos', 'guía el crecimiento', 'transmite información', 'permite la reproducción'],
      },
    },
  },

  'protein-synthesis': {
    ar: {
      about: {
        p: 'تركيب البروتينات يصنع البروتينات من التعليمات الموجودة في الحمض النووي. له خطوتان رئيسيتان: النسخ والترجمة.',
        list: ['النسخ', 'الترجمة', 'الرنا المرسال ينقل الشفرة', 'الريبوسومات تبني البروتينات'],
      },
      explore: {
        p: 'سوف تتبع المراحل من الحمض النووي إلى البروتين النهائي.',
        list: ['الحمض النووي', 'الرنا المرسال', 'الريبوسوم', 'الأحماض الأمينية', 'البروتين'],
      },
      use: [
        'حدد كل مرحلة.',
        'شاهد التغييرات ثلاثية الأبعاد.',
        'اقرأ التسميات.',
        'انتقل عبر الخطوات بالترتيب.',
      ],
      matter: {
        p: 'البروتينات تقوم بمعظم وظائف الخلايا، مثل بناء الهياكل وتسريع التفاعلات.',
        list: ['تبني الإنزيمات', 'تدعم الهيكل', 'تنقل الإشارات', 'تحارب المرض'],
      },
    },
    en: {
      about: {
        p: 'Protein synthesis builds proteins from instructions in DNA. It has two main steps: transcription and translation.',
        list: ['transcription', 'translation', 'mRNA carries the code', 'ribosomes build proteins'],
      },
      explore: {
        p: 'You will follow the stages from DNA to a finished protein.',
        list: ['DNA', 'mRNA', 'ribosome', 'amino acids', 'protein'],
      },
      use: [
        'Select each stage.',
        'Watch the 3D changes.',
        'Read the labels.',
        'Move through the steps in order.',
      ],
      matter: {
        p: 'Proteins do most jobs in cells, such as building structures and speeding up reactions.',
        list: ['builds enzymes', 'supports structure', 'carries signals', 'fights disease'],
      },
    },
    es: {
      about: {
        p: 'La síntesis de proteínas construye proteínas a partir de las instrucciones del ADN. Tiene dos pasos principales: transcripción y traducción.',
        list: ['transcripción', 'traducción', 'ARN mensajero transporta el código', 'ribosomas construyen proteínas'],
      },
      explore: {
        p: 'Seguirás las etapas desde el ADN hasta una proteína terminada.',
        list: ['ADN', 'ARN mensajero', 'ribosoma', 'aminoácidos', 'proteína'],
      },
      use: [
        'Selecciona cada etapa.',
        'Observa los cambios en 3D.',
        'Lee las etiquetas.',
        'Avanza por los pasos en orden.',
      ],
      matter: {
        p: 'Las proteínas realizan la mayoría de las tareas celulares, como construir estructuras y acelerar reacciones.',
        list: ['construyen enzimas', 'sostienen estructuras', 'transportan señales', 'combaten enfermedades'],
      },
    },
  },

  photosynthesis: {
    ar: {
      about: {
        p: 'البناء الضوئي يحول طاقة الضوء إلى طاقة كيميائية داخل خلايا النبات. يحدث داخل البلاستيدات الخضراء.',
        list: ['البلاستيدات الخضراء', 'يستخدم طاقة الضوء', 'ثاني أكسيد الكربون + ماء → جلوكوز + أكسجين', 'يغذي النباتات'],
      },
      explore: {
        p: 'سوف تكتشف المواد المتفاعلة ونواتج البناء الضوئي.',
        list: ['ضوء الشمس', 'ثاني أكسيد الكربون', 'الماء', 'الكلوروفيل', 'الجلوكوز', 'الأكسجين'],
      },
      use: [
        'ابدأ التفاعل.',
        'اضبط الضوء أو ثاني أكسيد الكربون.',
        'شاهد التغييرات.',
        'اقرأ تدفق الطاقة.',
      ],
      matter: {
        p: 'البناء الضوئي يمد النباتات بالغذاء ويطلق الأكسجين الذي تتنفسه الحيوانات.',
        list: ['ينتج الغذاء', 'يطلق الأكسجين', 'يستهلك ثاني أكسيد الكربون', 'يدعم النظم البيئية'],
      },
    },
    en: {
      about: {
        p: 'Photosynthesis turns light energy into chemical energy inside plant cells. It takes place in chloroplasts.',
        list: ['chloroplasts', 'uses light energy', 'carbon dioxide + water → glucose + oxygen', 'feeds plants'],
      },
      explore: {
        p: 'You will explore the reactants and products of photosynthesis.',
        list: ['sunlight', 'carbon dioxide', 'water', 'chlorophyll', 'glucose', 'oxygen'],
      },
      use: [
        'Start the reaction.',
        'Adjust light or carbon dioxide.',
        'Watch the changes.',
        'Read the energy flow.',
      ],
      matter: {
        p: 'Photosynthesis feeds plants and releases oxygen for animals to breathe.',
        list: ['makes food', 'releases oxygen', 'uses carbon dioxide', 'powers ecosystems'],
      },
    },
    es: {
      about: {
        p: 'La fotosíntesis convierte la energía luminosa en energía química dentro de las células vegetales. Ocurre en los cloroplastos.',
        list: ['cloroplastos', 'usa energía luminosa', 'dióxido de carbono + agua → glucosa + oxígeno', 'alimenta a las plantas'],
      },
      explore: {
        p: 'Explorarás los reactivos y productos de la fotosíntesis.',
        list: ['luz solar', 'dióxido de carbono', 'agua', 'clorofila', 'glucosa', 'oxígeno'],
      },
      use: [
        'Inicia la reacción.',
        'Ajusta la luz o el dióxido de carbono.',
        'Observa los cambios.',
        'Lee el flujo de energía.',
      ],
      matter: {
        p: 'La fotosíntesis alimenta a las plantas y libera oxígeno para que los animales respiren.',
        list: ['produce alimento', 'libera oxígeno', 'consume dióxido de carbono', 'impulsa ecosistemas'],
      },
    },
  },

  'plant-structure': {
    ar: {
      about: {
        p: 'النباتات لها جذور وساقات وأوراق وأزهار تعمل معًا. كل جزء له وظيفة خاصة.',
        list: ['الجذور تمتص الماء', 'الساق تنقل', 'الأوراق تصنع الغذاء', 'الأزهار تتكاثر'],
      },
      explore: {
        p: 'سوف تكتشف أجزاء النبات الرئيسية.',
        list: ['الجذور', 'الساق', 'الأوراق', 'الأزهار', 'البراعم'],
      },
      use: [
        'انقر على جزء من النبات لتحديده.',
        'استخدم الأشعة السينية لرؤية الداخل.',
        'اقرأ الوصف.',
        'قارن الأجزاء.',
      ],
      matter: {
        p: 'النباتات تصنع الغذاء، توفر المأوى، وتنتج الأكسجين للحياة على الأرض.',
        list: ['تمتص الماء', 'تنقل الغذاء', 'تصنع الجلوكوز', 'تدعم النمو'],
      },
    },
    en: {
      about: {
        p: 'Plants have roots, stems, leaves, and flowers that work together. Each part has a special job.',
        list: ['roots absorb water', 'stem transports', 'leaves make food', 'flowers reproduce'],
      },
      explore: {
        p: 'You will explore the main parts of a plant.',
        list: ['roots', 'stem', 'leaves', 'flowers', 'buds'],
      },
      use: [
        'Click a plant part to highlight it.',
        'Use x-ray to see inside.',
        'Read the description.',
        'Compare parts.',
      ],
      matter: {
        p: 'Plants make food, provide shelter, and produce oxygen for life on Earth.',
        list: ['absorb water', 'transport food', 'make glucose', 'support growth'],
      },
    },
    es: {
      about: {
        p: 'Las plantas tienen raíces, tallos, hojas y flores que trabajan juntas. Cada parte tiene una función especial.',
        list: ['raíces absorben agua', 'tallo transporta', 'hojas producen alimento', 'flores se reproducen'],
      },
      explore: {
        p: 'Explorarás las partes principales de una planta.',
        list: ['raíces', 'tallo', 'hojas', 'flores', 'yemas'],
      },
      use: [
        'Haz clic en una parte de la planta para resaltarla.',
        'Usa los rayos X para ver el interior.',
        'Lee la descripción.',
        'Compara las partes.',
      ],
      matter: {
        p: 'Las plantas producen alimento, dan refugio y generan oxígeno para la vida en la Tierra.',
        list: ['absorben agua', 'transportan alimento', 'producen glucosa', 'sostienen el crecimiento'],
      },
    },
  },

  transpiration: {
    ar: {
      about: {
        p: 'النتح هو فقدان بخار الماء من النباتات، وخاصة عبر الأوراق. يساعد على سحب الماء من الجذور إلى الأعلى.',
        list: ['بخار الماء يخرج من الأوراق', 'يسحب الماء من الجذور', 'يخفض الحرارة', 'الفتحات تفتح وتغلق'],
      },
      explore: {
        p: 'سوف تكتشف كيفية انتقال الماء عبر النبات وخروجه منه.',
        list: ['الجذور', 'الخشب', 'الفتحات', 'بخار الماء', 'الأوراق'],
      },
      use: [
        'ابدأ الدورة.',
        'شاهد الماء يتحرك عبر الخشب.',
        'افتح وأغلق الفتحات.',
        'راقب فقدان الماء.',
      ],
      matter: {
        p: 'النتح يبرد النباتات، ينقل المواد المغذية، ويساعد الماء على الانتقال من الجذور إلى الأوراق.',
        list: ['ينقل الماء', 'يبرد الأوراق', 'يجلب المعادن', 'يبقي النباتات منتصبة'],
      },
    },
    en: {
      about: {
        p: 'Transpiration is the loss of water vapor from plants, mainly through leaves. It helps pull water up from the roots.',
        list: ['water vapor exits leaves', 'pulls water from roots', 'cools the plant', 'stomata open and close'],
      },
      explore: {
        p: 'You will explore how water moves through a plant and leaves it.',
        list: ['roots', 'xylem', 'stomata', 'water vapor', 'leaves'],
      },
      use: [
        'Start the cycle.',
        'Watch water move through the xylem.',
        'Open and close stomata.',
        'Observe water loss.',
      ],
      matter: {
        p: 'Transpiration cools plants, moves nutrients, and helps water travel from roots to leaves.',
        list: ['moves water', 'cools leaves', 'brings minerals', 'keeps plants upright'],
      },
    },
    es: {
      about: {
        p: 'La transpiración es la pérdida de vapor de agua de las plantas, principalmente por las hojas. Ayuda a subir el agua desde las raíces.',
        list: ['el vapor de agua sale de las hojas', 'sube el agua desde las raíces', 'enfría la planta', 'los estomas se abren y cierran'],
      },
      explore: {
        p: 'Explorarás cómo el agua se mueve por la planta y la abandona.',
        list: ['raíces', 'xilema', 'estomas', 'vapor de agua', 'hojas'],
      },
      use: [
        'Inicia el ciclo.',
        'Observa el agua moverse por el xilema.',
        'Abre y cierra los estomas.',
        'Observa la pérdida de agua.',
      ],
      matter: {
        p: 'La transpiración enfría las plantas, mueve nutrientes y ayuda al agua a viajar desde las raíces hasta las hojas.',
        list: ['transporta agua', 'enfría hojas', 'trae minerales', 'mantiene plantas erguidas'],
      },
    },
  },

  'flower-reproduction': {
    ar: {
      about: {
        p: 'الأزهار هي الأجزاء التكاثرية للنباتات المزهرة. تُنتج البذور من خلال التلقيح والإخصاب.',
        list: ['التلقيح', 'الإخصاب', 'تكوين البذور', 'الأزهار تجذب ملقحات'],
      },
      explore: {
        p: 'سوف تكتشف أجزاء الزهرة وكيفية تكوين البذور.',
        list: ['البتلات', 'السبلات', 'الأسدية', 'المدقة', 'حبوب اللقاح', 'المبيض'],
      },
      use: [
        'حدد أجزاء الزهرة بالترتيب.',
        'شاهد التلقيح.',
        'تابع الإخصاب.',
        'راقب تكوين البذور.',
      ],
      matter: {
        p: 'تكاثر الزهرة ينتج نباتات جديدة والعديد من الفواكه والبذور التي نأكلها.',
        list: ['تجذب ملقحات', 'تنتج حبوب اللقاح', 'تكون البذور', 'تنمو الثمار'],
      },
    },
    en: {
      about: {
        p: 'Flowers are the reproductive parts of flowering plants. They make seeds through pollination and fertilization.',
        list: ['pollination', 'fertilization', 'makes seeds', 'flowers attract pollinators'],
      },
      explore: {
        p: 'You will explore the parts of a flower and how it makes seeds.',
        list: ['petals', 'sepals', 'stamen', 'pistil', 'pollen', 'ovary'],
      },
      use: [
        'Select flower parts in order.',
        'Watch pollination.',
        'Follow fertilization.',
        'See seed formation.',
      ],
      matter: {
        p: 'Flower reproduction creates new plants and many of the fruits and seeds we eat.',
        list: ['attracts pollinators', 'makes pollen', 'forms seeds', 'grows fruit'],
      },
    },
    es: {
      about: {
        p: 'Las flores son las partes reproductivas de las plantas con flor. Producen semillas mediante la polinización y la fertilización.',
        list: ['polinización', 'fertilización', 'producen semillas', 'las flores atraen polinizadores'],
      },
      explore: {
        p: 'Explorarás las partes de una flor y cómo forma semillas.',
        list: ['pétalos', 'sépalos', 'estambres', 'pistilo', 'polen', 'ovario'],
      },
      use: [
        'Selecciona las partes de la flor en orden.',
        'Observa la polinización.',
        'Sigue la fertilización.',
        'Ve la formación de la semilla.',
      ],
      matter: {
        p: 'La reproducción de las flores crea nuevas plantas y muchas de las frutas y semillas que comemos.',
        list: ['atraen polinizadores', 'producen polen', 'forman semillas', 'desarrollan frutos'],
      },
    },
  },

  bacteria: {
    ar: {
      about: {
        p: 'البكتيريا كائنات صغيرة أحادية الخلية. معظمها غير ضار، والكثير منها مفيد، لكن بعضها يسبب الأمراض.',
        list: ['أحادية الخلية', 'بدائية النواة', 'جدار خلوي', 'بعضها مفيد وبعضها ضار'],
      },
      explore: {
        p: 'سوف تكتشف البنية الأساسية للخلية البكتيرية.',
        list: ['الجدار الخلوي', 'الغشاء الخلوي', 'السيتوبلازم', 'الحمض النووي', 'السوط'],
      },
      use: [
        'أدر البكتيريا.',
        'كبّر الصورة.',
        'استخدم الأشعة السينية.',
        'اقرأ عن كل بنية.',
      ],
      matter: {
        p: 'البكتيريا تساعدنا على هضم الطعام، وتصنع المواد المغذية، وتعيد تدوير المادة في الطبيعة.',
        list: ['تحلل الفضلات', 'تثبّت النيتروجين', 'تصنع الفيتامينات', 'بعضها يسبب العدوى'],
      },
    },
    en: {
      about: {
        p: 'Bacteria are tiny single-celled organisms. Most are harmless and many are helpful, but some can cause disease.',
        list: ['single-celled', 'prokaryote', 'cell wall', 'some helpful, some harmful'],
      },
      explore: {
        p: 'You will explore the basic structure of a bacterial cell.',
        list: ['cell wall', 'cell membrane', 'cytoplasm', 'DNA', 'flagellum'],
      },
      use: [
        'Rotate the bacterium.',
        'Zoom in.',
        'Use x-ray.',
        'Read about each structure.',
      ],
      matter: {
        p: 'Bacteria help us digest food, make nutrients, and recycle matter in nature.',
        list: ['decompose waste', 'fix nitrogen', 'make vitamins', 'some cause infections'],
      },
    },
    es: {
      about: {
        p: 'Las bacterias son organismos diminutos de una sola célula. La mayoría son inofensivas y muchas son útiles, pero algunas causan enfermedades.',
        list: ['de una sola célula', 'procariota', 'pared celular', 'algunas útiles, otras dañinas'],
      },
      explore: {
        p: 'Explorarás la estructura básica de una célula bacteriana.',
        list: ['pared celular', 'membrana celular', 'citoplasma', 'ADN', 'flagelo'],
      },
      use: [
        'Gira la bacteria.',
        'Haz zoom.',
        'Usa los rayos X.',
        'Lee sobre cada estructura.',
      ],
      matter: {
        p: 'Las bacterias nos ayudan a digerir alimentos, producen nutrientes y reciclan materia en la naturaleza.',
        list: ['descomponen desechos', 'fijan nitrógeno', 'producen vitaminas', 'algunas causan infecciones'],
      },
    },
  },

  virus: {
    ar: {
      about: {
        p: 'الفيروس جسيم صغير يحمل مادة وراثية داخل غلاف بروتيني. لا يمكنه التكاثر بمفرده؛ يحتاج إلى خلية مضيفة.',
        list: ['ليس خلية', 'يحتاج إلى مضيف', 'مادة وراثية + غلاف بروتيني', 'يمكن أن يسبب المرض'],
      },
      explore: {
        p: 'سوف تكتشف البنية البسيطة للفيروس.',
        list: ['المادة الوراثية', 'الغلاف البروتيني', 'الغشاء الخارجي', 'الخلية المضيفة'],
      },
      use: [
        'أدر الفيروس.',
        'راجع المادة الوراثية الداخلية.',
        'اقرأ التسميات.',
        'قارن الأشكال.',
      ],
      matter: {
        p: 'الفيروسات تسبب أمراضًا مثل نزلات البرد والإنفلونزا، لكنها تساعد العلماء أيضًا على دراسة الخلايا والجينات.',
        list: ['يحتاج مضيفًا', 'يتضاعف داخل الخلايا', 'يمكن أن يسبب المرض', 'يستخدم في البحث'],
      },
    },
    en: {
      about: {
        p: 'A virus is a tiny particle with genetic material inside a protein coat. It cannot reproduce on its own; it needs a host cell.',
        list: ['not a cell', 'needs a host', 'genetic material + protein coat', 'can cause disease'],
      },
      explore: {
        p: 'You will explore the simple structure of a virus.',
        list: ['genetic material', 'protein coat', 'envelope', 'host cell'],
      },
      use: [
        'Rotate the virus.',
        'See the inner genetic material.',
        'Read labels.',
        'Compare shapes.',
      ],
      matter: {
        p: 'Viruses cause illnesses like colds and flu, but they also help scientists study cells and genes.',
        list: ['needs a host', 'copies inside cells', 'can cause disease', 'used in research'],
      },
    },
    es: {
      about: {
        p: 'Un virus es una partícula diminuta con material genético dentro de una cubierta proteica. No puede reproducirse solo; necesita una célula hospedadora.',
        list: ['no es una célula', 'necesita un hospedero', 'material genético + cubierta proteica', 'puede causar enfermedad'],
      },
      explore: {
        p: 'Explorarás la estructura simple de un virus.',
        list: ['material genético', 'cubierta proteica', 'envoltura', 'célula hospedadora'],
      },
      use: [
        'Gira el virus.',
        'Ve el material genético interno.',
        'Lee las etiquetas.',
        'Compara las formas.',
      ],
      matter: {
        p: 'Los virus causan enfermedades como resfriados y gripe, pero también ayudan a los científicos a estudiar células y genes.',
        list: ['necesita un hospedero', 'se copia dentro de células', 'puede causar enfermedad', 'se usa en investigación'],
      },
    },
  },

  fungi: {
    ar: {
      about: {
        p: 'الفطريات تشمل الفطار والعفن والخمائر. تنمو على شكل خيوط تُسمى الخيوط الفطرية، وتحلل المواد الميتة.',
        list: ['محللات', 'خيوط فطرية وميسيليوم', 'أبواغ', 'ليست نباتات'],
      },
      explore: {
        p: 'سوف تكتشف أجزاء الفطر الرئيسية.',
        list: ['القبعة', 'الخياشيم', 'الساق', 'الميسيليوم', 'الأبواغ'],
      },
      use: [
        'حدد جزءًا من الفطر.',
        'استخدم الأشعة السينية لرؤية الميسيليوم.',
        'اقرأ الحقائق.',
        'قارن الفطريات بالنباتات.',
      ],
      matter: {
        p: 'الفطريات محللات تحلل المواد الميتة وتعيد تدوير المغذيات، وتساعد النباتات على امتصاص الماء والمعادن.',
        list: ['تحلل المواد الميتة', 'تعيد تدوير المغذيات', 'تتشارك مع الجذور', 'تنتج خبزًا وأدوية'],
      },
    },
    en: {
      about: {
        p: 'Fungi include mushrooms, molds, and yeasts. They grow as thread-like hyphae and break down dead material.',
        list: ['decomposers', 'hyphae and mycelium', 'spores', 'not plants'],
      },
      explore: {
        p: 'You will explore the main parts of a fungus.',
        list: ['cap', 'gills', 'stem', 'mycelium', 'spores'],
      },
      use: [
        'Select a fungus part.',
        'Use x-ray to see the mycelium.',
        'Read the facts.',
        'Compare fungi with plants.',
      ],
      matter: {
        p: 'Fungi are decomposers that recycle nutrients and help plants absorb water and minerals.',
        list: ['break down dead matter', 'recycle nutrients', 'form partnerships with roots', 'make food like bread and medicine'],
      },
    },
    es: {
      about: {
        p: 'Los hongos incluyen setas, mohos y levaduras. Crecen como filamentos llamados hifas y descomponen materia muerta.',
        list: ['descomponedores', 'hifas y micelio', 'esporas', 'no son plantas'],
      },
      explore: {
        p: 'Explorarás las partes principales de un hongo.',
        list: ['sombrero', 'láminas', 'tallo', 'micelio', 'esporas'],
      },
      use: [
        'Selecciona una parte del hongo.',
        'Usa los rayos X para ver el micelio.',
        'Lee los datos.',
        'Compara hongos con plantas.',
      ],
      matter: {
        p: 'Los hongos son descomponedores que reciclan nutrientes y ayudan a las plantas a absorber agua y minerales.',
        list: ['descomponen materia muerta', 'reciclan nutrientes', 'se asocian con raíces', 'producen pan y medicinas'],
      },
    },
  },

  'blood-cells': {
    ar: {
      about: {
        p: 'الدم يحتوي على خلايا حمراء وخلايا بيضاء وصفائح دموية وبلازما. كل جزء له وظيفة مختلفة.',
        list: ['كريات حمراء تنقل الأكسجين', 'خلايا بيضاء تحارب العدوى', 'صفائح تسد الجروح', 'البلازما تنقل الخلايا'],
      },
      explore: {
        p: 'سوف تكتشف الخلايا الرئيسية في الدم ووظائفها.',
        list: ['كريات الدم الحمراء', 'خلايا الدم البيضاء', 'الصفائح الدموية', 'البلازما'],
      },
      use: [
        'انقر على أحد مكونات الدم.',
        'استخدم الأشعة السينية لرؤية شكله.',
        'اقرأ الوصف.',
        'قارن بين أنواع الخلايا.',
      ],
      matter: {
        p: 'خلايا الدم تنقل الأكسجين، تحارب الجراثيم، وتساعد على التئام الجروح.',
        list: ['تنقل الأكسجين', 'تحارب العدوى', 'تسد الجروح', 'تنقل المغذيات'],
      },
    },
    en: {
      about: {
        p: 'Blood contains red cells, white cells, platelets, and plasma. Each part has a different job.',
        list: ['red cells carry oxygen', 'white cells fight infection', 'platelets clot wounds', 'plasma carries cells'],
      },
      explore: {
        p: 'You will explore the main cells in blood and what they do.',
        list: ['red blood cells', 'white blood cells', 'platelets', 'plasma'],
      },
      use: [
        'Click a blood component.',
        'Use x-ray to see its shape.',
        'Read the description.',
        'Compare cell types.',
      ],
      matter: {
        p: 'Blood cells carry oxygen, fight germs, and help heal wounds.',
        list: ['carry oxygen', 'fight infection', 'clot wounds', 'transport nutrients'],
      },
    },
    es: {
      about: {
        p: 'La sangre contiene glóbulos rojos, glóbulos blancos, plaquetas y plasma. Cada parte tiene una función diferente.',
        list: ['glóbulos rojos transportan oxígeno', 'glóbulos blancos combaten infecciones', 'plaquetas coagulan heridas', 'plasma transporta células'],
      },
      explore: {
        p: 'Explorarás las células principales de la sangre y lo que hacen.',
        list: ['glóbulos rojos', 'glóbulos blancos', 'plaquetas', 'plasma'],
      },
      use: [
        'Haz clic en un componente sanguíneo.',
        'Usa los rayos X para ver su forma.',
        'Lee la descripción.',
        'Compara los tipos de células.',
      ],
      matter: {
        p: 'Las células sanguíneas transportan oxígeno, combaten gérmenes y ayudan a sanar heridas.',
        list: ['transportan oxígeno', 'combaten infecciones', 'coagulan heridas', 'transportan nutrientes'],
      },
    },
  },

  'punnett-square': {
    ar: {
      about: {
        p: 'مربع بانيت يوضح الاحتمالات الممكنة لتركيب الجينات من الأبوين. يساعد على التنبؤ بصفات النسل.',
        list: ['يتنبأ بالصفات', 'الأليلات السائدة والمتنحية', 'الطراز الجيني والمظهري', 'الاحتمال'],
      },
      explore: {
        p: 'سوف تكتشف كيف تندمج الأليلات لتكوين الطراز الجيني والمظهري.',
        list: ['الأليل السائد', 'الأليل المتنحي', 'الطراز الجيني', 'المظهر', 'الاحتمال'],
      },
      use: [
        'اختر أليلات الأبوين.',
        'املأ المربع.',
        'اقرأ تركيبات النسل.',
        'قارن الاحتمالات.',
      ],
      matter: {
        p: 'مربعات بانيت تساعدنا على فهم الوراثة والأمراض الوراثية والتربية.',
        list: ['تتنبأ بالصفات', 'توضح الاحتمال', 'تفسر الوراثة', 'تدعم البحث'],
      },
    },
    en: {
      about: {
        p: 'A Punnett square shows the possible combinations of genes from two parents. It helps predict the traits of offspring.',
        list: ['predicts traits', 'dominant and recessive alleles', 'genotype and phenotype', 'probability'],
      },
      explore: {
        p: 'You will explore how alleles combine to create genotypes and phenotypes.',
        list: ['dominant allele', 'recessive allele', 'genotype', 'phenotype', 'probability'],
      },
      use: [
        'Choose parent alleles.',
        'Fill the square.',
        'Read the offspring combinations.',
        'Compare probabilities.',
      ],
      matter: {
        p: 'Punnett squares help us understand inheritance, genetic disorders, and breeding.',
        list: ['predicts traits', 'shows probability', 'explains inheritance', 'supports research'],
      },
    },
    es: {
      about: {
        p: 'El cuadro de Punnett muestra las combinaciones posibles de genes de dos padres. Ayuda a predecir los rasgos de la descendencia.',
        list: ['predice rasgos', 'alelos dominantes y recesivos', 'genotipo y fenotipo', 'probabilidad'],
      },
      explore: {
        p: 'Explorarás cómo los alelos se combinan para crear genotipos y fenotipos.',
        list: ['alelo dominante', 'alelo recesivo', 'genotipo', 'fenotipo', 'probabilidad'],
      },
      use: [
        'Elige los alelos parentales.',
        'Llena el cuadro.',
        'Lee las combinaciones de la descendencia.',
        'Compara las probabilidades.',
      ],
      matter: {
        p: 'Los cuadros de Punnett nos ayudan a entender la herencia, trastornos genéticos y la cría.',
        list: ['predicen rasgos', 'muestran probabilidad', 'explican herencia', 'apoyan investigación'],
      },
    },
  },

  mitosis: {
    ar: {
      about: {
        p: 'الانقسام الميتوزي هو انقسام الخلية لإنتاج خليتين متطابقتين. يُستخدم للنمو والتجدد.',
        list: ['انقسام الخلية', 'خليتان متطابقتان', 'أربع مراحل', 'النمو والإصلاح'],
      },
      explore: {
        p: 'سوف تكتشف مراحل الانقسام الميتوزي.',
        list: ['الطور الاستعدادي', 'الطور الاستوائي', 'الطور الانفصالي', 'الطور النهائي'],
      },
      use: [
        'حدد كل مرحلة.',
        'شاهد حركة الكروموسومات.',
        'اقرأ التسميات.',
        'قارن قبل وبعد الانقسام.',
      ],
      matter: {
        p: 'الانقسام الميتوزي يسمح للكائنات الحية بالنمو واستبدال الخلايا التالفة وشفاء الجروح.',
        list: ['ينمي الأنسجة', 'يصلح الجروح', 'يستبدل الخلايا', 'يحافظ على عدد الكروموسومات'],
      },
    },
    en: {
      about: {
        p: 'Mitosis is cell division that makes two identical daughter cells. It is used for growth and repair.',
        list: ['cell division', 'two identical cells', 'four stages', 'growth and repair'],
      },
      explore: {
        p: 'You will explore the stages of mitosis.',
        list: ['prophase', 'metaphase', 'anaphase', 'telophase'],
      },
      use: [
        'Select each stage.',
        'Watch the chromosomes move.',
        'Read labels.',
        'Compare before and after division.',
      ],
      matter: {
        p: 'Mitosis lets organisms grow, replace damaged cells, and heal injuries.',
        list: ['grows tissues', 'repairs wounds', 'replaces cells', 'keeps chromosome number'],
      },
    },
    es: {
      about: {
        p: 'La mitosis es la división celular que produce dos células hijas idénticas. Se usa para el crecimiento y la reparación.',
        list: ['división celular', 'dos células idénticas', 'cuatro etapas', 'crecimiento y reparación'],
      },
      explore: {
        p: 'Explorarás las etapas de la mitosis.',
        list: ['profase', 'metafase', 'anafase', 'telofase'],
      },
      use: [
        'Selecciona cada etapa.',
        'Observa el movimiento de los cromosomas.',
        'Lee las etiquetas.',
        'Compara antes y después de la división.',
      ],
      matter: {
        p: 'La mitosis permite que los organismos crezcan, reemplacen células dañadas y curen lesiones.',
        list: ['crece tejidos', 'repara heridas', 'reemplaza células', 'conserva el número de cromosomas'],
      },
    },
  },

  meiosis: {
    ar: {
      about: {
        p: 'الانقسام الاختزالي ينتج خلايا جنسية بمعدل نصف الكروموسومات. يولّد تباينًا وراثيًا من خلال انقسامين.',
        list: ['ينتج خلايا جنسية', 'نصف الكروموسومات', 'تباين وراثي', 'انقسامان'],
      },
      explore: {
        p: 'سوف تكتشف مراحل ونتائج الانقسام الاختزالي.',
        list: ['الكروموسومات المتناظرة', 'التبادل', 'الخلايا الجنسية', 'أربع خلايا بنائية'],
      },
      use: [
        'انتقل عبر كل انقسام.',
        'شاهد انفصال أزواج الكروموسومات.',
        'اقرأ التسميات.',
        'قارن مع الانقسام الميتوزي.',
      ],
      matter: {
        p: 'الانقسام الاختزالي ينتج البويضات والحيوانات المنوية، ويمزج الجينات لجعل كل نسل فريد.',
        list: ['ينتج خلايا جنسية', 'ينصف الكروموسومات', 'يخلق تنوعًا', 'يشكل الحيوانات المنوية والبويضات'],
      },
    },
    en: {
      about: {
        p: 'Meiosis makes sex cells with half the chromosomes. It creates genetic variation through two divisions.',
        list: ['makes gametes', 'half chromosomes', 'genetic variation', 'two divisions'],
      },
      explore: {
        p: 'You will explore the stages and results of meiosis.',
        list: ['homologous chromosomes', 'crossing over', 'gametes', 'four daughter cells'],
      },
      use: [
        'Move through each division.',
        'Watch chromosome pairs separate.',
        'Read labels.',
        'Compare with mitosis.',
      ],
      matter: {
        p: 'Meiosis creates eggs and sperm, and it mixes genes to make every offspring unique.',
        list: ['makes gametes', 'halves chromosomes', 'creates variation', 'forms sperm and eggs'],
      },
    },
    es: {
      about: {
        p: 'La meiosis produce células sexuales con la mitad de cromosomas. Crea variación genética mediante dos divisiones.',
        list: ['produce gametos', 'mitad de cromosomas', 'variación genética', 'dos divisiones'],
      },
      explore: {
        p: 'Explorarás las etapas y resultados de la meiosis.',
        list: ['cromosomas homólogos', 'entrecruzamiento', 'gametos', 'cuatro células hijas'],
      },
      use: [
        'Avanza por cada división.',
        'Observa cómo se separan los pares de cromosomas.',
        'Lee las etiquetas.',
        'Compara con la mitosis.',
      ],
      matter: {
        p: 'La meiosis crea óvulos y espermatozoides, y mezcla genes para hacer que cada descendiente sea único.',
        list: ['produce gametos', 'reduce cromosomas', 'crea variación', 'forma espermatozoides y óvulos'],
      },
    },
  },

  'dna-replication': {
    ar: {
      about: {
        p: 'تضاعف الحمض النووي ينسخ المادة الوراثية قبل انقسام الخلية. يحتوي كل حمض نووي جديد على سلسلة قديمة وسلسلة جديدة.',
        list: ['ينسخ الحمض النووي', 'نصف محافظ', 'الإنزيمات تفك اللولب', 'قبل انقسام الخلية'],
      },
      explore: {
        p: 'سوف تكتشف كيف ينفتح اللولب المزدوج ويبنى نسختين جديدتين.',
        list: ['اللولب المزدوج', 'الإنزيمات', 'النيوكليوتيدات', 'جزيئان متطابقان'],
      },
      use: [
        'ابدأ التضاعف.',
        'شاهد فك اللولب.',
        'راقب اقتران القواعد الجديدة.',
        'تابع حتى تتكون النسختان.',
      ],
      matter: {
        p: 'تضاعف الحمض النووي يسمح للخلايا بالانقسام والنمو ونقل الجينات للجيل التالي.',
        list: ['ينسخ الجينات', 'يسمح بالنمو', 'يصلح التلف', 'ينقل المعلومات'],
      },
    },
    en: {
      about: {
        p: 'DNA replication copies the genetic material before a cell divides. Each new DNA has one old strand and one new strand.',
        list: ['copies DNA', 'semi-conservative', 'enzymes unzip helix', 'before cell division'],
      },
      explore: {
        p: 'You will explore how the double helix opens and builds two new copies.',
        list: ['double helix', 'enzymes', 'nucleotides', 'two identical molecules'],
      },
      use: [
        'Start replication.',
        'Watch the helix unwind.',
        'See new bases pair.',
        'Follow until two copies form.',
      ],
      matter: {
        p: 'DNA replication lets cells divide, grow, and pass genes to the next generation.',
        list: ['copies genes', 'allows growth', 'repairs damage', 'passes information'],
      },
    },
    es: {
      about: {
        p: 'La replicación del ADN copia el material genético antes de que una célula se divida. Cada nuevo ADN tiene una cadena vieja y una nueva.',
        list: ['copia ADN', 'semiconservadora', 'enzimas desenrollan la hélice', 'antes de la división celular'],
      },
      explore: {
        p: 'Explorarás cómo la doble hélice se abre y construye dos copias nuevas.',
        list: ['doble hélice', 'enzimas', 'nucleótidos', 'dos moléculas idénticas'],
      },
      use: [
        'Inicia la replicación.',
        'Observa cómo se desenrolla la hélice.',
        'Ve cómo se emparejan las nuevas bases.',
        'Sigue hasta que se formen dos copias.',
      ],
      matter: {
        p: 'La replicación del ADN permite que las células se dividan, crezcan y transmitan genes a la siguiente generación.',
        list: ['copia genes', 'permite crecimiento', 'repara daños', 'transmite información'],
      },
    },
  },

  pcr: {
    ar: {
      about: {
        p: 'تفاعل البلمرة المتسلسل ينسخ كمية صغيرة من الحمض النووي عدة مرات. يُستخدم في المختبرات لدراسة الجينات وتشخيص الأمراض.',
        list: ['ينسخ الحمض النووي', 'الانفصال والتهجين والاستطالة', 'دورات كثيرة', 'عينة صغيرة تكفي'],
      },
      explore: {
        p: 'سوف تكتشف الخطوات الثلاث الرئيسية للتفاعل.',
        list: ['الانفصال', 'التهجين', 'الاستطالة'],
      },
      use: [
        'اضبط درجة الحرارة لكل خطوة.',
        'شاهد تزايد نسخ الحمض النووي.',
        'كرر الدورات.',
        'اقرأ النتائج.',
      ],
      matter: {
        p: 'تفاعل البلمرة المتسلسل يساعد على كشف العدوات، وتحديد الأشخاص، ودراسة كميات ضئيلة من الحمض النووي.',
        list: ['ينسخ الحمض النووي', 'يكشف الأمراض', 'يحدد العينات', 'يدعم البحث'],
      },
    },
    en: {
      about: {
        p: 'PCR copies a small amount of DNA many times. It is used in labs to study genes and diagnose diseases.',
        list: ['copies DNA', 'denature, anneal, extend', 'many cycles', 'small sample enough'],
      },
      explore: {
        p: 'You will explore the three main steps of PCR.',
        list: ['denaturation', 'annealing', 'extension'],
      },
      use: [
        'Set the temperature for each step.',
        'Watch the DNA copies increase.',
        'Repeat cycles.',
        'Read the results.',
      ],
      matter: {
        p: 'PCR helps detect infections, identify people, and study tiny amounts of DNA.',
        list: ['copies DNA', 'detects disease', 'identifies samples', 'supports research'],
      },
    },
    es: {
      about: {
        p: 'La PCR copia una pequeña cantidad de ADN muchas veces. Se usa en laboratorios para estudiar genes y diagnosticar enfermedades.',
        list: ['copia ADN', 'desnaturalización, alineamiento, extensión', 'muchos ciclos', 'basta una muestra pequeña'],
      },
      explore: {
        p: 'Explorarás los tres pasos principales de la PCR.',
        list: ['desnaturalización', 'alineamiento', 'extensión'],
      },
      use: [
        'Ajusta la temperatura de cada paso.',
        'Observa cómo aumentan las copias de ADN.',
        'Repite los ciclos.',
        'Lee los resultados.',
      ],
      matter: {
        p: 'La PCR ayuda a detectar infecciones, identificar personas y estudiar cantidades mínimas de ADN.',
        list: ['copia ADN', 'detecta enfermedades', 'identifica muestras', 'apoya investigación'],
      },
    },
  },

  crispr: {
    ar: {
      about: {
        p: 'تقنية كريسبر CRISPR هي أداة لتحرير الجينات. تستخدم دليلًا للعثور على تسلسل الحمض النووي وبروتينًا يُسمى Cas9 لقطعه.',
        list: ['تحرير الجينات', 'الرنا الدليلي', 'بروتين Cas9', 'قطع الحمض النووي'],
      },
      explore: {
        p: 'سوف تكتشف خطوات تحرير الجينات بتقنية كريسبر.',
        list: ['الرنا الدليلي', 'Cas9', 'الحمض النووي المستهدف', 'القطع والإصلاح'],
      },
      use: [
        'اختر جينًا مستهدفًا.',
        'وجه الرنا الدليلي إلى التسلسل.',
        'شاهد Cas9 يقطع.',
        'راقب النتيجة المحررة.',
      ],
      matter: {
        p: 'كريسبر يمكن أن تعالج الأمراض، وتحسّن المحاصيل، وتساعد العلماء على دراسة وظيفة الجينات.',
        list: ['تعالج الأمراض الوراثية', 'تحسن المحاصيل', 'تدرس الجينات', 'قد تشفي العدوات'],
      },
    },
    en: {
      about: {
        p: 'CRISPR is a tool that edits genes. It uses a guide to find a DNA sequence and a protein called Cas9 to cut it.',
        list: ['gene editing', 'guide RNA', 'Cas9 protein', 'cuts DNA'],
      },
      explore: {
        p: 'You will explore the steps of gene editing with CRISPR.',
        list: ['guide RNA', 'Cas9', 'target DNA', 'cut and repair'],
      },
      use: [
        'Select a target gene.',
        'Guide the RNA to the sequence.',
        'Watch Cas9 cut.',
        'Observe the edited result.',
      ],
      matter: {
        p: 'CRISPR can treat diseases, improve crops, and help scientists study gene function.',
        list: ['treats genetic disease', 'improves crops', 'studies genes', 'may cure infections'],
      },
    },
    es: {
      about: {
        p: 'CRISPR es una herramienta que edita genes. Usa una guía para encontrar una secuencia de ADN y una proteína llamada Cas9 para cortarla.',
        list: ['edición de genes', 'ARN guía', 'proteína Cas9', 'corta ADN'],
      },
      explore: {
        p: 'Explorarás los pasos de la edición génica con CRISPR.',
        list: ['ARN guía', 'Cas9', 'ADN diana', 'corte y reparación'],
      },
      use: [
        'Selecciona un gen diana.',
        'Guía el ARN a la secuencia.',
        'Observa cómo Cas9 corta.',
        'Ve el resultado editado.',
      ],
      matter: {
        p: 'CRISPR puede tratar enfermedades, mejorar cultivos y ayudar a los científicos a estudiar la función de los genes.',
        list: ['trata enfermedades genéticas', 'mejora cultivos', 'estudia genes', 'puede curar infecciones'],
      },
    },
  },

  'gel-electrophoresis': {
    ar: {
      about: {
        p: 'الترحيل الكهربائي للهلام يفصل قطع الحمض النووي حسب الحجم باستخدام تيار كهربائي. القطع الأصغر تتحرك أبعد في الهلام.',
        list: ['يفصل الحمض النووي حسب الحجم', 'تيار كهربائي', 'هلام', 'ينشئ حزمًا'],
      },
      explore: {
        p: 'سوف تكتشف كيف تُنشئ عينات الحمض النووي حزمًا على الهلام.',
        list: ['الهلام', 'التيار الكهربائي', 'عينات الحمض النووي', 'الحزم حسب الحجم'],
      },
      use: [
        'حمّل العينات في الآبار.',
        'شغّل التيار الكهربائي.',
        'شاهد انفصال الحزم حسب الحجم.',
        'قارن الأنماط.',
      ],
      matter: {
        p: 'يُستخدم الترحيل الكهربائي في الطب الشرعي والطب والبحث لتحليل الحمض النووي.',
        list: ['يحدد الأشخاص', 'يفحص الجينات', 'يدرس العينات', 'يحل الجرائم'],
      },
    },
    en: {
      about: {
        p: 'Gel electrophoresis separates DNA pieces by size using an electric current. Smaller pieces move farther through the gel.',
        list: ['separates DNA by size', 'electric current', 'gel matrix', 'creates bands'],
      },
      explore: {
        p: 'You will explore how DNA samples create bands on a gel.',
        list: ['gel', 'electric current', 'DNA samples', 'size bands'],
      },
      use: [
        'Load samples into wells.',
        'Run the electric current.',
        'Watch bands separate by size.',
        'Compare patterns.',
      ],
      matter: {
        p: 'Gel electrophoresis is used in forensics, medicine, and research to analyze DNA.',
        list: ['identifies people', 'checks genes', 'studies samples', 'solves crimes'],
      },
    },
    es: {
      about: {
        p: 'La electroforesis en gel separa fragmentos de ADN por tamaño usando una corriente eléctrica. Los fragmentos más pequeños se mueven más lejos por el gel.',
        list: ['separa ADN por tamaño', 'corriente eléctrica', 'matriz de gel', 'crea bandas'],
      },
      explore: {
        p: 'Explorarás cómo las muestras de ADN crean bandas en un gel.',
        list: ['gel', 'corriente eléctrica', 'muestras de ADN', 'bandas por tamaño'],
      },
      use: [
        'Carga las muestras en los pocillos.',
        'Aplica la corriente.',
        'Observa cómo se separan las bandas por tamaño.',
        'Compara los patrones.',
      ],
      matter: {
        p: 'La electroforesis en gel se usa en forense, medicina e investigación para analizar ADN.',
        list: ['identifica personas', 'revisa genes', 'estudia muestras', 'resuelve crímenes'],
      },
    },
  },

  'ecosystem-balance': {
    ar: {
      about: {
        p: 'النظام البيئي هو مجتمع من الكائنات الحية وبيئتها. يحدث التوازن عندما تبقى أعداد الكائنات مستقرة مع مرور الوقت.',
        list: ['الفريسة والمفترس', 'دورات الأعداد', 'المنتجون والمستهلكون', 'الاستقرار'],
      },
      explore: {
        p: 'سوف تكتشف كيف تؤثر أعداد الفريسة والمفترس على بعضها البعض.',
        list: ['المنتجون', 'الفريسة', 'المفترسات', 'المحللات'],
      },
      use: [
        'غيّر عدد الفريسة أو المفترسات.',
        'شغّل المحاكاة.',
        'راقب منحنى الأعداد.',
        'ابحث عن توازن مستقر.',
      ],
      matter: {
        p: 'الأنظمة البيئية الصحية تنقّي الماء، وتلقح المحاصيل، وتدعم العديد من الأنواع.',
        list: ['تنقّي الهواء والماء', 'تلقح النباتات', 'تعيد تدوير المغذيات', 'تدعم التنوع الحيوي'],
      },
    },
    en: {
      about: {
        p: 'An ecosystem is a community of living things and their environment. Balance happens when populations stay stable over time.',
        list: ['prey and predators', 'population cycles', 'producers and consumers', 'stability'],
      },
      explore: {
        p: 'You will explore how prey and predator numbers affect each other.',
        list: ['producers', 'prey', 'predators', 'decomposers'],
      },
      use: [
        'Change the number of prey or predators.',
        'Run the simulation.',
        'Watch the population graph.',
        'Find a stable balance.',
      ],
      matter: {
        p: 'Healthy ecosystems clean water, pollinate crops, and support many species.',
        list: ['cleans air and water', 'pollinates plants', 'recycles nutrients', 'supports biodiversity'],
      },
    },
    es: {
      about: {
        p: 'Un ecosistema es una comunidad de seres vivos y su entorno. El equilibrio ocurre cuando las poblaciones se mantienen estables con el tiempo.',
        list: ['presas y depredadores', 'ciclos poblacionales', 'productores y consumidores', 'estabilidad'],
      },
      explore: {
        p: 'Explorarás cómo los números de presas y depredadores se afectan mutuamente.',
        list: ['productores', 'presas', 'depredadores', 'descomponedores'],
      },
      use: [
        'Cambia la cantidad de presas o depredadores.',
        'Ejecuta la simulación.',
        'Observa la gráfica poblacional.',
        'Encuentra un equilibrio estable.',
      ],
      matter: {
        p: 'Los ecosistemas saludables limpian el agua, polinizan cultivos y mantienen muchas especies.',
        list: ['limpian aire y agua', 'polinizan plantas', 'reciclan nutrientes', 'apoyan la biodiversidad'],
      },
    },
  },

  'food-chain': {
    ar: {
      about: {
        p: 'السلسلة الغذائية توضح كيف تنتقل الطاقة من كائن حي إلى آخر. النباتات تصنع الغذاء، والحيوانات تأكل النباتات أو حيوانات أخرى، والمحللات تعيد تدوير المغذيات.',
        list: ['تدفق الطاقة', 'من المنتجين إلى المستهلكين', 'المحللات تعيد التدوير', 'مستويات غذائية'],
      },
      explore: {
        p: 'سوف تكتشف أدوار الكائنات الحية في السلسلة الغذائية.',
        list: ['المنتجون', 'المستهلكات الأولية', 'المستهلكات الثانوية', 'المحللات'],
      },
      use: [
        'ابنِ سلسلة غذائية.',
        'أضف كائنات.',
        'شغّل المحاكاة.',
        'شاهد كيف تتدفق الطاقة.',
      ],
      matter: {
        p: 'السلاسل الغذائية تساعدنا على فهم اعتماد الكائنات الحية على بعضها في النظام البيئي.',
        list: ['تنقل الطاقة', 'تربط الأنواع', 'تعيد تدوير المغذيات', 'تحافظ على صحة الأنظمة'],
      },
    },
    en: {
      about: {
        p: 'A food chain shows how energy moves from one organism to another. Plants make food, animals eat plants or other animals, and decomposers recycle nutrients.',
        list: ['energy flow', 'producers to consumers', 'decomposers recycle', 'trophic levels'],
      },
      explore: {
        p: 'You will explore the roles of organisms in a food chain.',
        list: ['producers', 'primary consumers', 'secondary consumers', 'decomposers'],
      },
      use: [
        'Build a food chain.',
        'Add organisms.',
        'Run the simulation.',
        'Watch how energy flows.',
      ],
      matter: {
        p: 'Food chains help us understand how living things depend on each other in an ecosystem.',
        list: ['moves energy', 'connects species', 'recycles nutrients', 'keeps ecosystems healthy'],
      },
    },
    es: {
      about: {
        p: 'Una cadena alimentaria muestra cómo la energía se mueve de un organismo a otro. Las plantas producen alimento, los animales comen plantas u otros animales, y los descomponedores reciclan nutrientes.',
        list: ['flujo de energía', 'de productores a consumidores', 'descomponedores reciclan', 'niveles tróficos'],
      },
      explore: {
        p: 'Explorarás los roles de los organismos en una cadena alimentaria.',
        list: ['productores', 'consumidores primarios', 'consumidores secundarios', 'descomponedores'],
      },
      use: [
        'Construye una cadena alimentaria.',
        'Añade organismos.',
        'Ejecuta la simulación.',
        'Observa cómo fluye la energía.',
      ],
      matter: {
        p: 'Las cadenas alimentarias nos ayudan a entender cómo los seres vivos dependen unos de otros en un ecosistema.',
        list: ['mueven energía', 'conectan especies', 'reciclan nutrientes', 'mantienen ecosistemas sanos'],
      },
    },
  },

  'water-cycle': {
    ar: {
      about: {
        p: 'دورة الماء تنقل الماء بين الأرض والغلاف الجوي. ليس لها بداية أو نهاية.',
        list: ['التبخر', 'التكثف', 'الهطول', 'التجمّع'],
      },
      explore: {
        p: 'سوف تكتشف المراحل الرئيسية لدورة الماء.',
        list: ['التبخر', 'التكثف', 'الهطول', 'التجمّع'],
      },
      use: [
        'ابدأ الدورة.',
        'سخّن الماء ليبخر.',
        'برده لتتكون السحب.',
        'شاهد المطر يعود إلى الأنهار والمحيطات.',
      ],
      matter: {
        p: 'دورة الماء توفر المياه العذبة للنباتات والحيوانات والبشر.',
        list: ['تنقل الماء', 'تملئ الأنهار', 'تنشئ المطر', 'تدعم الحياة'],
      },
    },
    en: {
      about: {
        p: 'The water cycle moves water between Earth and the atmosphere. It has no beginning or end.',
        list: ['evaporation', 'condensation', 'precipitation', 'collection'],
      },
      explore: {
        p: 'You will explore the main stages of the water cycle.',
        list: ['evaporation', 'condensation', 'precipitation', 'collection'],
      },
      use: [
        'Start the cycle.',
        'Heat water to evaporate.',
        'Cool it to form clouds.',
        'Watch rain return to rivers and oceans.',
      ],
      matter: {
        p: 'The water cycle provides fresh water for plants, animals, and people.',
        list: ['moves water', 'fills rivers', 'makes rain', 'supports life'],
      },
    },
    es: {
      about: {
        p: 'El ciclo del agua mueve el agua entre la Tierra y la atmósfera. No tiene principio ni fin.',
        list: ['evaporación', 'condensación', 'precipitación', 'acumulación'],
      },
      explore: {
        p: 'Explorarás las etapas principales del ciclo del agua.',
        list: ['evaporación', 'condensación', 'precipitación', 'acumulación'],
      },
      use: [
        'Inicia el ciclo.',
        'Calienta el agua para que se evapore.',
        'Enfríala para formar nubes.',
        'Observa cómo la lluvia vuelve a ríos y océanos.',
      ],
      matter: {
        p: 'El ciclo del agua proporciona agua dulce para plantas, animales y personas.',
        list: ['transporta agua', 'llena ríos', 'produce lluvia', 'sostiene la vida'],
      },
    },
  },
};

export const biologyHelpTopics: Record<string, Record<string, HelpSection[]>> = {
  ar: {},
  en: {},
  es: {},
};

for (const [topic, byLocale] of Object.entries(topics)) {
  for (const locale of ['ar', 'en', 'es'] as Locale[]) {
    biologyHelpTopics[locale][topic] = buildTopicSections(locale, byLocale[locale]);
  }
}
