mp3ファイルのid3タグ仕様について
==

# id3v1

識別子"TAG" (3:0-2)
$ xx,xx,xx

title (30:3-32)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

artist (30:33-62)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

album (30:63-92)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

date (4:93-96)
$ xx,xx,xx,xx

comment (30:97-126)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

genre (1:127)
$ xx


# id3v1.1

識別子"TAG" (3:0-2)
$ xx,xx,xx

title (30:3-32)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

artist (30:33-62)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

album (30:63-92)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

date (4:93-96)
$ xx,xx,xx,xx

comment (28:97-124)
$ xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx
  xx,xx,xx,xx,xx,xx,xx,xx,xx,xx

null (1:125)
$ xx

track (1:126)
$ xx

genre (1:127)
$ xx


# genre-master
0	Blues
1	Classic Rock
2	Country
3	Dance
4	Disco
5	Funk
6	Grunge
7	Hip-Hop
8	Jazz
9	Metal
10	New Age
11	Oldies
12	Other（その他）
13	Pop
14	R&B
15	Rap
16	Reggae
17	Rock
18	Techno
19	Industrial
20	Alternative
21	Ska
22	Death Metal
23	Pranks（英語版）
24	Soundtrack
25	Euro-Techno
26	Ambient
27	Trip-Hop
28	Vocal
29	Jazz-funk
30	Fusion
31	Trance
32	Classical
33	Instrumental
34	Acid
35	House
36	Game
37	Sound Clip（英語版）
38	Gospel
39	Noise
40	Alt. Rock
41	Bass
42	Soul
43	Punk
44	Space（英語版）
45	Meditative
46	Instrumental pop
47	Instrumental rock（英語版）
48	Ethnic
49	Gothic
50	Darkwave（英語版）
51	Techno-Industrial
52	Electronic
53	Pop-folk
54	Eurodance
55	Dream
56	Southern Rock
57	Comedy
58	Cult
59	Gangsta
60	Top 40
61	Christian Rap
62	Pop/Funk
63	Jungle
64	Native American
65	Cabaret
66	New Wave
67	Psychedelic
68	Rave（英語版）
69	Showtunes
70	Trailer
71	Lo-Fi
72	Tribal（英語版）
73	Acid Punk
74	Acid Jazz
75	Polka
76	Retro
77	Musical
78	Rock & Roll
79	Hard Rock
80	Folk
81	Folk-Rock
82	National Folk（英語版）
83	Swing
84	Fast Fusion
85	Bebob
86	Latin
87	Revival
88	Celtic
89	Bluegrass
90	Avantgarde
91	Gothic Rock
92	Progressive Rock
93	Psychedelic Rock
94	Symphonic Rock
95	Slow Rock
96	Big Band
97	Chorus
98	Easy Listening
99	Acoustic
100	Humour
101	Speech
102	Chanson
103	Opera
104	Chamber Music
105	Sonata
106	Symphony
107	Booty Bass
108	Primus
109	Porn Groove
110	Satire
111	Slow Jam
112	Club
113	Tango
114	Samba
115	Folklore
116	Ballad
117	Power Ballad
118	Rhythmic Soul
119	Freestyle
120	Duet
121	Punk Rock
122	Drum Solo
123	A capella
124	Euro-House
125	Dance Hall
126	Goa
127	Drum & Bass
128	Club-House
129	Hardcore
130	Terror
131	Indie
132	BritPop
133	Afro-punk
134	Polsk Punk
135	Beat
136	Christian gangsta rap
137	Heavy Metal
138	Black Metal
139	Crossover
140	Contemporary Christian
141	Christian Rock
142	Merengue
143	Salsa
144	Thrash Metal
145	Anime
146	JPop
147	Synthpop


# id3v2.2

- header

id (3:0-2)
$ xx,xx,xx

version (3:3-5)
$ xx,xx,xx

flg (1:6)
$ xx

size (4:7-10)
$ xx,xx,xx,xx


- frame-datas

id (4:0-3)
$ xx,xx,xx,xx

size (4:4-7)
$ xx,xx,xx,xx

flg (2:8-9)
$ xx,xx

data (10:10-...)
$ xx,...


- 拡張header

size (4:0-3)
$ xx,xx,xx,xx

flg (2:4-5)
$ xx,xx

padding-size (4:6-9)
$ xx,xx,xx,xx



# id3v2.3

- header

id (3:0-2)
$ xx,xx,xx

version (3:3-5)
$ xx,xx,xx

flg (1:6)
$ xx

size (4:7-10)
$ xx,xx,xx,xx


- frame-datas

id (4:0-3)
$ xx,xx,xx,xx

size (4:4-7)
$ xx,xx,xx,xx

flg (2:8-9)
$ xx,xx

data (10:10-...)
$ xx,...


- 拡張header

size (4:0-3)
$ xx,xx,xx,xx

flg (2:4-5)
$ xx,xx

padding-size (4:6-9)
$ xx,xx,xx,xx




# id3v2.4

...
