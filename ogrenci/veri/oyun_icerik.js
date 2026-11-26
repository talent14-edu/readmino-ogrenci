// Oyun dolabı içerikleri: kitaptan bağımsız, okuduğunu anlamaya yönelik.
// Seviye öğrencinin sınıfından gelir: 1-2. sınıf minik, 3. sınıf kasif, 4. sınıf usta.
// Çoktan seçmeli maddelerde doğru cevap her zaman ilk seçenektir; ekranda karıştırılır.
const OYUN_ICERIK = {
 // Mino Dedektif: metinde açıkça yazmayanı ipuçlarından çıkar.
 dedektif: {
  minik: [
   ['Selin took her umbrella and put on her rain boots.', 'What is the weather like outside?', ['Rainy', 'Very hot', 'Sunny with no wind'], 'People use umbrellas and rain boots when it rains.'],
   ['Arda blew out the seven candles on the cake. Everyone clapped.', 'What day is it today?', ['Arda’s birthday', 'A holiday', 'The first day of school'], 'A cake with candles and clapping tell us it is a birthday.'],
   ['Zeynep put on her school uniform and her backpack. The school bus was waiting at the door.', 'Where is Zeynep going?', ['To school', 'To the park', 'To the shop'], 'A uniform, a backpack and a school bus show she is going to school.'],
   ['When Mert opened the door, he heard a tiny “woof woof”. A tail was wagging inside the box.', 'What is inside the box?', ['A puppy', 'A kitten', 'A toy car'], 'A “woof woof” and a wagging tail tell us it is a dog.']
  ],
  kasif: [
   ['As soon as Nil came in, she wrinkled her nose. Smoke was coming from the kitchen. Her mother ran to the oven.', 'What might have happened in the kitchen?', ['The food in the oven burned', 'The tap overflowed', 'The power went out'], 'The smell, the smoke and running to the oven tell us the food burned.'],
   ['The night watchman lit his lantern. The street lamps came on one by one. The birds were flying back to their nests.', 'What time of day is it?', ['Evening', 'Morning', 'Noon'], 'Street lamps coming on and birds going home show it is evening.'],
   ['Efe came out of the test, ran to his mother with a skip and proudly showed her his paper.', 'How did Efe’s test probably go?', ['It went well', 'It went badly', 'He did not take the test'], 'Skipping and proudly showing the paper tell us he is happy.'],
   ['Ece built a sandcastle. When the waves came, the castle fell down. Ece picked up her bucket and started again.', 'What kind of child is Ece?', ['One who never gives up', 'One who gets angry easily', 'One who is afraid of the sea'], 'Starting again after her castle fell shows she does not give up.']
  ],
  usta: [
   ['When the doorbell rang, Can’s hands were covered in flour. On the counter there were eggshells, sugar and a mixing bowl. The oven light was on.', 'What might Can be doing?', ['Baking a cake', 'Painting a picture', 'Doing homework'], 'Flour, eggs, sugar and a hot oven together show that a cake is being made.'],
   ['There were two rows of footprints on the beach: one big, one tiny. The tiny prints stopped now and then, then spread farther apart and ran ahead.', 'What do the footprints tell us most?', ['A child walking with an adult and sometimes running', 'Two runners in a race', 'Dogs playing in the sand'], 'Big and small prints show two people walking together; steps that spread apart show running.'],
   ['When the teacher came into the classroom, “Happy Birthday!” was written on the board. There were balloons on the desks, and the children were giggling behind the curtain.', 'What did the children prepare?', ['A surprise party for their teacher', 'A test', 'A play'], 'The message, the balloons and the hiding children show a surprise birthday party.'],
   ['Every morning Kerem watered the basil on the balcony. Before going on holiday, he left his neighbor the key and a short note.', 'What is the note most likely about?', ['Watering the basil', 'Painting the door', 'Where the holiday is'], 'Kerem watered the plant every day, so someone else has to do it while he is away.']
  ]
 },
 // Başlık Bul: paragrafın ana fikrine en uygun başlık.
 baslik: {
  minik: [
   ['Ela’s cat Snowy sits in the sun by the window every morning. She watches the birds, then falls asleep.', ['Snowy’s mornings', 'The birds’ nest', 'Ela’s school']],
   ['It started to rain. Can opened his umbrella. He jumped over the puddles and ran home.', ['A rainy walk home', 'A sunny day', 'Can’s bike']],
   ['Asya and her grandpa planted tomato seedlings in the garden. They watered them every day. A month later, they picked bright red tomatoes.', ['Tomatoes in the garden', 'Grandpa’s hat', 'A trip to the market']],
   ['It was book day at school. Everyone brought their favorite book. The classroom looked like a library.', ['Book day in class', 'A ball game at break', 'The school bus']]
  ],
  kasif: [
   ['Bees carry pollen as they fly from flower to flower. This helps the flowers turn into fruit. Without bees, we could not eat many fruits.', ['How bees help fruit grow', 'How do bees sting?', 'The colors of flowers']],
   ['The chain on Emre’s bike kept coming off. His neighbor, Uncle Ali, showed him how to put it back on. Now Emre can fix the chain by himself.', ['Emre learns to fix it', 'Uncle Ali’s car', 'A bike race']],
   ['Trash on the beach hurts sea turtles. So a group of students cleans the beach every Saturday.', ['Students who clean the beach', 'How do turtles swim?', 'A Saturday picnic']],
   ['When water freezes, it turns into ice. When it heats up, it turns into steam. So water can be a solid, a liquid or a gas.', ['The states of water', 'Icy drinks', 'The sound of rain']]
  ],
  usta: [
   ['Long ago, people wrote letters and waited weeks for an answer. Today a message reaches the other side of the world in seconds. Still, some people say a handwritten letter is the most precious gift of all.', ['Faster messages and the value of a letter', 'A day in the life of a mail carrier', 'The invention of the telephone']],
   ['The new shelves in the library were empty. The students decided to donate the books they had read. Within a month, the shelves were full and the library became the busiest place in the school.', ['Shelves filled by sharing', 'Library rules', 'The color of the shelves']],
   ['On its own, an ant is small and weak. But when ants work together, they carry loads many times bigger than themselves and gather enough food for the whole winter.', ['The power of working together', 'The color of ants', 'The cold of winter']],
   ['A pine tree can live for a hundred years, but a forest fire can destroy it in a few minutes. That is why it is so important not to light fires in the forest.', ['Protecting forests from fire', 'How tall a pine tree grows', 'Camping food']]
  ]
 },
 // Kelime Dedektifi: bilinmeyen kelimenin anlamını cümleden çıkar.
 kelime: {
  minik: [
   ['The cat finished its milk, **purred** and fell asleep.', ['Made a soft happy sound', 'Ran away', 'Cried']],
   ['When it snowed, the garden turned **snow-white**.', ['Very white', 'A little dirty', 'Very green']],
   ['He ran so much that he was **out of breath**.', ['Breathing hard and fast', 'Sleepy', 'Hungry']],
   ['The baby was sleeping, so we came into the room **on tiptoe**.', ['Very quietly', 'Running', 'Jumping']]
  ],
  kasif: [
   ['The branches **swayed** so hard in the wind that leaves flew everywhere.', ['Moved quickly from side to side', 'Broke', 'Grew']],
   ['When she found the lost key, she felt **relieved** and took a deep breath.', ['No longer worried', 'Scared', 'Tired']],
   ['Grandpa put the old photos into the box **carefully**.', ['With great care', 'Quickly', 'Angrily']],
   ['While waiting for the result, she was **bursting with excitement**.', ['Very, very excited', 'Very bored', 'Sleepy']]
  ],
  usta: [
   ['When the castle was surrounded, the people began to store **provisions**; they might not be able to go outside for months.', ['Stored food', 'Weapons', 'Money']],
   ['Everyone was talking, so Elif **hesitated** to share her idea, but then she found her courage and spoke.', ['Was unsure and waited', 'Spoke at once', 'Laughed']],
   ['Because of the drought, the lake **receded**, and the boats by the shore were left sitting on the sand.', ['Had less water', 'Overflowed', 'Froze']],
   ['The winning team did not forget to **congratulate** their opponents.', ['Say “well done” to', 'Make angry', 'Forget']]
  ]
 },
 // Hikâye Sırası: cümleler doğru sırada yazılıdır, oyunda karıştırılır.
 sira: {
  minik: [
   ['Ece planted the seedling in the soil.', 'She watered the seedling every day.', 'The seedling grew and bloomed.'],
   ['Can brushed his teeth.', 'He put on his pajamas.', 'He got into bed and fell asleep.'],
   ['Mom mixed flour, eggs and sugar.', 'She put the mixture in the oven.', 'We ate the warm cake together.']
  ],
  kasif: [
   ['Ali found a wallet in the park.', 'There was an address inside the wallet.', 'He and his mother went to that address.', 'The wallet’s owner thanked them with a smile.'],
   ['Clouds covered the sky.', 'Lightning flashed and thunder rumbled.', 'The rain poured down.', 'When the rain stopped, a rainbow appeared.'],
   ['The caterpillar grew by eating leaves.', 'It spun a cocoon around itself.', 'It waited inside the cocoon for many days.', 'A colorful butterfly came out of the cocoon.']
  ],
  usta: [
   ['The neighborhood park was run-down.', 'The children decided to write a letter to the mayor.', 'In the letter, they explained why the park needed fixing.', 'A few weeks later, new swings were put up in the park.', 'On opening day, the children thanked the mayor.'],
   ['Elif borrowed a book about space from the library.', 'While reading it, she wondered why the Moon changes shape.', 'For a month, she watched the Moon every night and drew it.', 'She showed her drawings to her classmates.', 'Her teacher put her work up on the school board.'],
   ['Deniz signed up for swimming lessons.', 'In the first lessons, she was afraid to get into the water.', 'Her teacher first taught her how to breathe.', 'Each week she grew a little braver.', 'At the end of the term, she swam from one end of the pool to the other.']
  ]
 },
 // Yönerge Ustası: dokuz nesnelik bir rafta yönergeyi okuyup doğru nesneye dokun (keşif).
 // Simge anahtarları (top=ball, kitap=book, ev=house, agac=tree, portakal=orange, zil=bell,
 // yildiz=star, cay=tea, kupa=trophy, damla=drop) ikon dosya adlarıdır, çevrilmez.
 yonerge: {
  minik: [
   [['top', 'kitap', 'ev', 'agac', 'portakal', 'zil', 'yildiz', 'cay', 'kupa'], 'Touch the fruit next to the tree.', 4],
   [['ev', 'yildiz', 'top', 'kitap', 'damla', 'agac', 'zil', 'portakal', 'kupa'], 'In the top row, touch the thing next to the house.', 1],
   [['kupa', 'top', 'cay', 'agac', 'ev', 'kitap', 'yildiz', 'zil', 'portakal'], 'Touch the thing below the house in the middle.', 7],
   [['portakal', 'top', 'kitap', 'cay', 'yildiz', 'zil', 'ev', 'kupa', 'agac'], 'Touch the thing that makes a sound when you shake it.', 5]
  ],
  kasif: [
   [['kitap', 'top', 'cay', 'zil', 'portakal', 'ev', 'agac', 'kupa', 'yildiz'], 'Find the thing below the ball. Then touch the one to its right.', 5],
   [['ev', 'agac', 'kupa', 'yildiz', 'kitap', 'top', 'cay', 'zil', 'portakal'], 'Touch the thing between something you drink and something you eat.', 7],
   [['top', 'kupa', 'agac', 'kitap', 'zil', 'cay', 'ev', 'yildiz', 'portakal'], 'In the left column, touch the thing above the book.', 0],
   [['cay', 'ev', 'kitap', 'portakal', 'top', 'agac', 'kupa', 'yildiz', 'zil'], 'Touch the thing to the right of the prize you win in a contest.', 7]
  ],
  usta: [
   [['zil', 'kitap', 'top', 'agac', 'kupa', 'portakal', 'cay', 'ev', 'yildiz'], 'Start at the thing in the middle. Move diagonally to the top right corner and touch the thing there.', 2],
   [['kitap', 'cay', 'ev', 'top', 'yildiz', 'zil', 'portakal', 'agac', 'kupa'], 'It is not something you eat, drink or read. Touch it in the top row.', 2],
   [['agac', 'zil', 'portakal', 'kupa', 'kitap', 'cay', 'yildiz', 'top', 'ev'], 'First find the thing in the middle. Touch the thing below the one to its left.', 6],
   [['ev', 'top', 'kupa', 'cay', 'agac', 'yildiz', 'zil', 'portakal', 'kitap'], 'In the bottom row, find the thing that rings when you shake it. Touch the thing two steps to its right.', 8]
  ]
 },
 // Yol Senin: dallanan hikâye. Yanlış yol, metni yeniden okumaya yönlendirir.
 yol: {
  minik: {ad: 'The lost ball', bas: 'b', d: {
   b: ['Ela’s red ball is lost. Her mom calls out: “Your ball is in the garden, under the tree.”', [['Look under the tree in the garden', 'a'], ['Look under the bed in your room', 'y1']]],
   y1: ['There are only slippers under the bed. Your mom told you where the ball was. Try to remember!', [['Go back', 'b']]],
   a: ['There are two balls under the tree: a blue one and a red one.', [['Take the red ball', 's'], ['Take the blue ball', 'y2']]],
   y2: ['This is not Ela’s ball! What color was Ela’s ball?', [['Go back', 'a']]],
   s: ['Ela found her red ball and jumped for joy. You read carefully!', []]},
   soru: ['Where was Ela’s ball?', ['Under the tree', 'Under the bed', 'In the kitchen']]},
  kasif: {ad: 'The note in the library', bas: 'b', d: {
   b: ['You find a note in the school library: “The treasure is behind the encyclopedia with the blue cover. But first, say hello to the librarian.”', [['Run to the shelves right away', 'y1'], ['Say hello to the librarian', 'a']]],
   y1: ['The librarian raises her eyebrows: “Did you read the note all the way to the end?” What did the note ask you to do first?', [['Go back', 'b']]],
   a: ['The librarian smiles and points to the shelves. There are two encyclopedias: one with a red cover and one with a blue cover.', [['Look behind the red one', 'y2'], ['Look behind the blue one', 'c']]],
   y2: ['There is only dust behind it. Which color did the note talk about?', [['Go back', 'a']]],
   c: ['Behind the encyclopedia there is a small box. On top it says: “Before you open me, take me to the librarian.”', [['Open the box right away', 'y3'], ['Take it to the librarian', 's']]],
   y3: ['The box is locked! Read the words on top again.', [['Go back', 'c']]],
   s: ['The librarian opens the box. Inside is a reading card with your name on it: “Whoever reads the note carefully finds the treasure.”', []]},
   soru: ['What did you have to do first to reach the treasure?', ['Say hello to the librarian', 'Look behind the red book', 'Open the box']]},
  usta: {ad: 'The note in the mountain house', bas: 'b', d: {
   b: ['You are visiting your grandpa. There is a note on the table: “I am in the garden. We need wood to light the stove. The woodshed is to the north of the house, at the foot of the mossy wall.” You have a compass in your pocket.', [['Find north with the compass and walk there', 'a'], ['Go to the sunny garden south of the house', 'y1']]],
   y1: ['There are only flowers in the sunny garden. Which direction did the note say the woodshed was in?', [['Go back', 'b']]],
   a: ['There are two walls on the north side. One is freshly painted, the other is covered in green moss.', [['Go to the freshly painted wall', 'y2'], ['Go to the mossy wall', 'c']]],
   y2: ['There is only an old bike here. Which wall did the note describe?', [['Go back', 'a']]],
   c: ['You found the woodshed. Inside there is wet wood and dry wood. At the very bottom of the note you see a small P.S.: “Wet wood makes smoke that stings your eyes.”', [['Take the wet wood', 'y3'], ['Take the dry wood', 's']]],
   y3: ['The wet wood starts to smoke in the stove, and the smoke makes your eyes water! Remember the P.S. in the note.', [['Go back', 'c']]],
   s: ['The stove crackles happily. When Grandpa comes in, he is surprised: “You read the note from start to finish and used every clue!”', []]},
   soru: ['Why did you choose the dry wood?', ['Wet wood makes smoke', 'Dry wood is heavier', 'Grandpa likes dry wood']]}
 }
};
