const CONFIG = {
  USE_MOCK: true,
  MOCK_ALBUMS: [
    {
      id: "mock-1",
      albumName: "21",
      artistName: "Adele",
      albumCover: "imgsHL/Alb1.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=49453377",
      sales: 56.4
    },
    {
      id: "mock-2",
      albumName: "Abbey Road",
      artistName: "The Beatles",
      albumCover: "imgsHL/Alb2.png",
      artistImage: "https://stringsmagazine.com/how-the-beatles-launched-a-string-playing-revolution/",
      sales: 31
    },
    {
      id: "mock-3",
      albumName: "Appetite for Destruction",
      artistName: "Guns N' Roses",
      albumCover: "imgsHL/Alb3.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=171742573",
      sales: 35
    },
    {
      id: "mock-4",
      albumName: "Bad",
      artistName: "Michael Jackson",
      albumCover: "imgsHL/Alb4.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=176338533",
      sales: 40
    },
    {
      id: "mock-5",
      albumName: "Bat Out of Hell",
      artistName: "Meat Loaf",
      albumCover: "imgsHL/Alb5.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=114498379",
      sales: 43
    },
    {
      id: "mock-6",
      albumName: "2Pac Greatest Hits",
      artistName: "2Pac",
      albumCover: "imgsHL/Alb6.png",
      artistImage: "https://www.chipublib.org/wp-content/uploads/sites/3/2021/05/PAC-e1621485082232.jpeg",
      sales: 10.6
    },
    {
      id: "mock-7",
      albumName: "Born in the U.S.A.",
      artistName: "Bruce Springsteen",
      albumCover: "imgsHL/Alb7.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=183276194",
      sales: 30
    },
    {
      id: "mock-8",
      albumName: "Come Away with Me",
      artistName: "Norah Jones",
      albumCover: "imgsHL/Alb8.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=163794315",
      sales: 27
    },
    {
      id: "mock-9",
      albumName: "Come On Over",
      artistName: "Shania Twain",
      albumCover: "imgsHL/Alb9.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=164916020",
      sales: 40
    },
    {
      id: "mock-10",
      albumName: "Greatest Hits",
      artistName: "Queen",
      albumCover: "imgsHL/Alb10.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=136512656",
      sales: 25.9
    },
    {
      id: "mock-11",
      albumName: "Hotel California",
      artistName: "Eagles",
      albumCover: "imgsHL/Alb11.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=11573559",
      sales: 42
    },
    {
      id: "mock-12",
      albumName: "Jagged Little Pill",
      artistName: "Alanis Morissette",
      albumCover: "imgsHL/Alb12.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=113566362",
      sales: 33
    },
    {
      id: "mock-13",
      albumName: "Metallica",
      artistName: "Metallica",
      albumCover: "imgsHL/Alb13.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=81253578",
      sales: 30
    },
    {
      id: "mock-14",
      albumName: "Nevermind",
      artistName: "Nirvana",
      albumCover: "imgsHL/Alb14.png",
      artistImage: "https://commons.wikimedia.org/w/index.php?curid=185950883",
      sales: 30
    },
    {
      id: "mock-15",
      albumName: "Purple Rain",
      artistName: "Prince",
      albumCover: "imgsHL/Alb15.png",
      artistImage: "https://via.placeholder.com/800x500/111827/f472b6?text=Prince",
      sales: 25
    },
    {
      id: "mock-16",
      albumName: "Rumours",
      artistName: "Fleetwood Mac",
      albumCover: "imgsHL/Alb16.png",
      artistImage: "https://via.placeholder.com/800x500/111827/f472b6?text=Fleetwood+Mac",
      sales: 42.5
    },
    {
      id: "mock-17",
      albumName: "Saturday Night Fever",
      artistName: "Bee Gees",
      albumCover: "imgsHL/Alb17.png",
      artistImage: "https://via.placeholder.com/800x500/111827/fbbf24?text=Bee+Gees",
      sales: 40
    },
    {
      id: "mock-18",
      albumName: "The Bodyguard",
      artistName: "Whitney Houston",
      albumCover: "imgsHL/Alb18.png",
      artistImage: "https://via.placeholder.com/800x500/111827/ef4444?text=Whitney+Houston",
      sales: 45
    },
    {
      id: "mock-19",
      albumName: "The Dark Side of the Moon",
      artistName: "Pink Floyd",
      albumCover: "imgsHL/Alb19.png",
      artistImage: "https://via.placeholder.com/800x500/111827/8b5cf6?text=Pink+Floyd",
      sales: 46
    },
    {
      id: "mock-20",
      albumName: "The Immaculate Collection",
      artistName: "Madonna",
      albumCover: "imgsHL/Alb20.png",
      artistImage: "https://via.placeholder.com/800x500/111827/f472b6?text=Madonna",
      sales: 32
    },
    {
      id: "mock-21",
      albumName: "The Beatles (White Album)",
      artistName: "The Beatles",
      albumCover: "imgsHL/Alb21.png",
      artistImage: "https://via.placeholder.com/800x500/111827/38bdf8?text=The+Beatles",
      sales: 21
    },
    {
      id: "mock-22",
      albumName: "Thriller",
      artistName: "Michael Jackson",
      albumCover: "imgsHL/Alb22.png",
      artistImage: "https://via.placeholder.com/800x500/111827/f97316?text=Michael+Jackson",
      sales: 70
    },
    {
      id: "mock-23",
      albumName: "Views",
      artistName: "Drake",
      albumCover: "imgsHL/Alb23.png",
      artistImage: "https://via.placeholder.com/800x500/111827/f97316?text=Michael+Jackson",
      sales: 10
    },
    {
      id: "mock-24",
      albumName: "Dr.Dre's 2001 Album",
      artistName: "Dr.Dre",
      albumCover: "imgsHL/Alb24.png",
      artistImage: "https://via.placeholder.com/800x500/111827/38bdf8?text=The+Beatles",
      sales: 10.8
    },
    {
      id: "mock-25",
      albumName: "The Notorious B.I.G.'s Greatest Hits album",
      artistName: "The Notorious B.I.G.",
      albumCover: "imgsHL/Alb25.png",
      artistImage: "https://via.placeholder.com/800x500/111827/38bdf8?text=The+Beatles",
      sales: 2
    }
  ]
};