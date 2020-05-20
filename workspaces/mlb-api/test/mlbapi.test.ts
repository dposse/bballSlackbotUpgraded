import {
  getAllGamesOnDate,
  _getAllGamesOnDate,
  convertDateToString,
  _getGamesPlayed,
  getGamesPlayed,
} from '../src/index';
import { IMLBApi } from '../src/types/index';
import mlbGamesTestData from '../src/mlbGamesTestData';

// remove the .skip to make sure package is working
describe.skip('dependencies tests', () => {
  test('make sure mlbgames is still working as expected', () => {
    const Mlbgames = require('mlbgames');
    const options = {
      path: 'year_2011/month_07/day_23/',
    };

    const mlbgames = new Mlbgames(options);
    mlbgames.get((err: any, games: any) => {
      expect(err).toBeNull();
      expect(games).toBeDefined();
      // if you look at the data and check the games online, you'll notice that only 14 games were played on 07/23/2011
      //  mlbgames counts postponed games as well
      expect(games.length).toEqual(15);
    });
  });
});

describe.skip('mlbapi tests', () => {
  describe('_getAllGamesOnDate() unit tests', () => {
    test('exists', () => {
      expect(_getAllGamesOnDate).toBeDefined();
    });

    test('accepts api (dependency injection) and date object as arguments', () => {
      // arrange
      const api: IMLBApi = {
        get: function(_date: Date): Promise<any[]> {
          return new Promise((resolve, _reject) => {
            resolve([]);
          });
        },
      };
      const today: Date = new Date();
      const results = _getAllGamesOnDate(api)(today);
      expect(results).toBeTruthy();
    });

    describe('happy path', () => {
      test('get empty array with mocked api', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((resolve, _reject) => {
              resolve([]);
            });
          },
        };

        // act
        const now = new Date();
        const results = await _getAllGamesOnDate(api)(now);

        // assert
        expect(results).toStrictEqual([]);
      });
    });

    describe('sad path', () => {
      //below is a bad test maybe? it passes with no changes. since _getAllGamesOnDate
      // returns a promise, api.get throwing an error works without a code change
      // I guess still useful for testing refactors?
      test('mocked api promise rejects', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((_resolve, _reject) => {
              throw new Error('oh no it broke');
            });
          },
        };

        // act
        const now = new Date();
        try {
          await _getAllGamesOnDate(api)(now);
        } catch (error) {
          // assert
          expect(error).toBeDefined();
          expect(error).toEqual(new Error('oh no it broke'));
        }
      });
    });
  });

  describe('convertDateToString() unit tests', () => {
    test('exists', () => {
      // arrange
      // act
      // assert
      expect(convertDateToString).toBeDefined();
    });

    test('converts date object to proper string, leading zero in month', () => {
      // arrange
      const testDate: Date = new Date('July 23, 2011');
      const expectedPath: string = 'year_2011/month_07/day_23/';

      // act
      const resultPath: string = convertDateToString(testDate);

      // assert
      expect(resultPath).toBe(expectedPath);
    });

    test('converts date object to proper string, leading zero in day', () => {
      // arrange
      const testDate: Date = new Date('December 01, 2011');
      const expectedPath: string = 'year_2011/month_12/day_01/';

      // act
      const resultPath: string = convertDateToString(testDate);

      // assert
      expect(resultPath).toBe(expectedPath);
    });

    test('converts date object to proper string, leading zero in day and month', () => {
      // arrange
      const testDate: Date = new Date('January 01, 2011');
      const expectedPath: string = 'year_2011/month_01/day_01/';

      // act
      const resultPath: string = convertDateToString(testDate);

      // assert
      expect(resultPath).toBe(expectedPath);
    });
  });

  describe('getAllGamesOnDate() integration tests', () => {
    test('exists', () => {
      expect(getAllGamesOnDate).toBeDefined();
    });

    test('gets games from 07/23/2011 (date used in mlbGames npm package readme)', async () => {
      // arrange
      // testDate is from mlbGames npm package readme
      const testDate = new Date('July 23, 2011');
      const expectedResult = mlbGamesTestData;

      // act
      const result = await getAllGamesOnDate(testDate);

      // assert
      expect(result.length).toEqual(expectedResult.length - 1); // comparing actual results can get messy
      // since many nested objects
      // -1 because I duplicated one object to test double headers
    });

    test('gets games from 05/13/2019 (date used because it only has 7 games)', async () => {
      // arrange
      // testDate is a random date that does not have 15 games played
      const testDate = new Date('May 13, 2019');
      const notExpectedResult = mlbGamesTestData;

      // act
      const result = await getAllGamesOnDate(testDate);

      // assert
      expect(result.length).not.toEqual(notExpectedResult.length); // comparing actual results can get messy
      // since many nested objects
      expect(result).toHaveLength(7);
    });
  });

  describe('_getGamesPlayed() unit tests', () => {
    test('exists', () => {
      expect(_getGamesPlayed).toBeDefined();
    });

    test('accepts api (dependency injection), team name and date object as arguments', () => {
      // arrange
      const api: IMLBApi = {
        get: function(_date: Date): Promise<any[]> {
          return new Promise((resolve, _reject) => {
            resolve([]);
          });
        },
      };
      const today: Date = new Date();
      const teamCode: string = 'nya'; //this can be any valid team code

      // act
      const results = _getGamesPlayed(api)(teamCode, today);

      // assert
      expect(results).toBeTruthy();
    });

    describe('happy path', () => {
      test('gets a single game from results', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((resolve, _reject) => {
              resolve(mlbGamesTestData);
            });
          },
        };
        const today: Date = new Date();
        const teamCode: string = 'nya'; //first game in mlbGamesTestData is nya vs oak
        const expectedResult = [
          {
            links: {
              mlbtv:
                "bam.media.launchPlayer({calendar_event_id:'14-288400-2011-07-23',media_type:'video'})",
              wrapup:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=wrap&c_id=mlb',
              home_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288400-2011-07-23',media_type:'audio'})",
              away_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288400-2011-07-23',media_type:'audio'})",
              home_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=preview&c_id=mlb',
              away_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=preview&c_id=mlb',
              preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=preview&c_id=mlb',
              tv_station: 'YES',
            },
            broadcast: {
              home: { tv: 'YES', radio: 'WCBS 880, WADO 1280' },
              away: { tv: 'NBCSCA', radio: '95.7 FM The Game' },
            },
            status: {
              status: 'Final',
              ind: 'F',
              inning_state: 'Bottom',
              note: '',
              reason: '',
              inning: '9',
              balls: '1',
              strikes: '1',
              outs: '3',
              top_inning: 'N',
              is_perfect_game: 'N',
              is_no_hitter: 'N',
            },
            home_runs: {
              player: [
                {
                  id: '425545',
                  last: 'Willingham',
                  first: 'Josh',
                  name_display_roster: 'Willingham',
                  number: '16',
                  hr: '1',
                  std_hr: '13',
                  inning: '3',
                  runners: '1',
                  team_code: 'oak',
                },
                {
                  id: '430897',
                  last: 'Swisher',
                  first: 'Nick',
                  name_display_roster: 'Swisher',
                  number: '33',
                  hr: '1',
                  std_hr: '12',
                  inning: '6',
                  runners: '0',
                  team_code: 'nya',
                },
                {
                  id: '425686',
                  last: 'Matsui',
                  first: 'Hideki',
                  name_display_roster: 'Matsui',
                  number: '55',
                  hr: '1',
                  std_hr: '8',
                  inning: '7',
                  runners: '0',
                  team_code: 'oak',
                },
              ],
            },
            linescore: {
              inning: [
                { home: '0', away: '0' },
                { home: '1', away: '0' },
                { home: '0', away: '2' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '1' },
                { home: '0', away: '1' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
              ],
              r: { home: '3', away: '4', diff: '1' },
              h: { home: '9', away: '10' },
              e: { home: '0', away: '0' },
              hr: { home: '1', away: '2' },
              sb: { home: '0', away: '0' },
              so: { home: '0', away: '0' },
            },
            winning_pitcher: {
              first: 'Rich',
              id: '425848',
              last: 'Harden',
              name_display_roster: 'Harden',
              number: '18',
              wins: '2',
              losses: '1',
              era: '4.63',
            },
            losing_pitcher: {
              first: 'A.J.',
              id: '150359',
              last: 'Burnett',
              name_display_roster: 'Burnett',
              number: '34',
              wins: '8',
              losses: '8',
              era: '4.21',
            },
            save_pitcher: {
              first: 'Andrew',
              id: '457732',
              last: 'Bailey',
              name_display_roster: 'Bailey',
              number: '40',
              wins: '0',
              losses: '2',
              era: '2.37',
              saves: '11',
              svo: '13',
            },
            video_thumbnail:
              'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_7_preview.jpg',
            video_thumbnails: {
              thumbnail: [
                {
                  scenario: '7',
                  width: '124',
                  height: '70',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_7_preview.jpg',
                },
                {
                  scenario: '37',
                  width: '160',
                  height: '90',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_37_preview.jpg',
                },
              ],
            },
            game_media: {
              media: {
                type: 'game',
                calendar_event_id: '14-288400-2011-07-23',
                start: '2011-07-23T17:05:00Z',
                title: 'OAK @ NYY',
                has_mlbtv: 'true',
                has_milbtv: 'false',
                thumbnail:
                  'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_7_preview.jpg',
                free: 'NO',
                enhanced: 'N',
                media_state: 'media_archive',
              },
            },
            id: '2011/07/23/oakmlb-nyamlb-1',
            game_pk: '288400',
            venue: 'Yankee Stadium',
            original_date: '2011/07/23',
            resume_date: '',
            time: '1:05',
            time_date: '2011/07/23 1:05',
            time_date_aw_lg: '2011/07/23 1:05',
            time_date_hm_lg: '2011/07/23 1:05',
            time_zone: 'ET',
            ampm: 'PM',
            first_pitch_et: '',
            away_time: '10:05',
            away_time_zone: 'PT',
            away_ampm: 'AM',
            home_time: '1:05',
            home_time_zone: 'ET',
            home_ampm: 'PM',
            game_type: 'R',
            tiebreaker_sw: 'N',
            time_zone_aw_lg: '-4',
            time_zone_hm_lg: '-4',
            time_aw_lg: '1:05',
            aw_lg_ampm: 'PM',
            tz_aw_lg_gen: 'ET',
            time_hm_lg: '1:05',
            hm_lg_ampm: 'PM',
            tz_hm_lg_gen: 'ET',
            venue_id: '3313',
            stats_season: '2011',
            scheduled_innings: '9',
            description: '',
            series: 'Regular Season',
            ser_home_nbr: '33',
            series_num: '33',
            ser_games: '3',
            home_name_abbrev: 'NYY',
            home_code: 'nya',
            home_file_code: 'nyy',
            home_team_id: '147',
            home_team_city: 'NY Yankees',
            home_team_name: 'Yankees',
            home_division: 'E',
            home_league_id: '103',
            home_sport_code: 'mlb',
            away_name_abbrev: 'OAK',
            away_code: 'oak',
            away_file_code: 'oak',
            away_team_id: '133',
            away_team_city: 'Oakland',
            away_team_name: 'Athletics',
            away_division: 'W',
            away_league_id: '103',
            away_sport_code: 'mlb',
            day: 'SAT',
            gameday_sw: 'P',
            double_header_sw: 'N',
            game_nbr: '1',
            tbd_flag: 'N',
            venue_w_chan_loc: 'USNY0172',
            location: 'Bronx, NY',
            gameday: '2011_07_23_oakmlb_nyamlb_1',
            away_games_back: '',
            away_games_back_wildcard: '',
            away_win: '44',
            away_loss: '56',
            home_games_back: '',
            home_games_back_wildcard: '',
            home_win: '58',
            home_loss: '40',
            game_data_directory:
              '/components/game/mlb/year_2011/month_07/day_23/gid_2011_07_23_oakmlb_nyamlb_1',
            inning_break_length: '',
            league: 'AA',
          },
        ];

        // act
        const results = await _getGamesPlayed(api)(teamCode, today);

        // assert
        expect(results.length).toEqual(expectedResult.length);
        expect(results).toStrictEqual(expectedResult);
      });

      test('gets a single game from results - same as previous but different team code from same game', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((resolve, _reject) => {
              resolve(mlbGamesTestData);
            });
          },
        };
        const today: Date = new Date();
        const teamCode: string = 'oak'; //first game in mlbGamesTestData is nya vs oak
        const expectedResult = [
          {
            links: {
              mlbtv:
                "bam.media.launchPlayer({calendar_event_id:'14-288400-2011-07-23',media_type:'video'})",
              wrapup:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=wrap&c_id=mlb',
              home_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288400-2011-07-23',media_type:'audio'})",
              away_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288400-2011-07-23',media_type:'audio'})",
              home_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=preview&c_id=mlb',
              away_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=preview&c_id=mlb',
              preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_oakmlb_nyamlb_1&mode=preview&c_id=mlb',
              tv_station: 'YES',
            },
            broadcast: {
              home: { tv: 'YES', radio: 'WCBS 880, WADO 1280' },
              away: { tv: 'NBCSCA', radio: '95.7 FM The Game' },
            },
            status: {
              status: 'Final',
              ind: 'F',
              inning_state: 'Bottom',
              note: '',
              reason: '',
              inning: '9',
              balls: '1',
              strikes: '1',
              outs: '3',
              top_inning: 'N',
              is_perfect_game: 'N',
              is_no_hitter: 'N',
            },
            home_runs: {
              player: [
                {
                  id: '425545',
                  last: 'Willingham',
                  first: 'Josh',
                  name_display_roster: 'Willingham',
                  number: '16',
                  hr: '1',
                  std_hr: '13',
                  inning: '3',
                  runners: '1',
                  team_code: 'oak',
                },
                {
                  id: '430897',
                  last: 'Swisher',
                  first: 'Nick',
                  name_display_roster: 'Swisher',
                  number: '33',
                  hr: '1',
                  std_hr: '12',
                  inning: '6',
                  runners: '0',
                  team_code: 'nya',
                },
                {
                  id: '425686',
                  last: 'Matsui',
                  first: 'Hideki',
                  name_display_roster: 'Matsui',
                  number: '55',
                  hr: '1',
                  std_hr: '8',
                  inning: '7',
                  runners: '0',
                  team_code: 'oak',
                },
              ],
            },
            linescore: {
              inning: [
                { home: '0', away: '0' },
                { home: '1', away: '0' },
                { home: '0', away: '2' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '1' },
                { home: '0', away: '1' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
              ],
              r: { home: '3', away: '4', diff: '1' },
              h: { home: '9', away: '10' },
              e: { home: '0', away: '0' },
              hr: { home: '1', away: '2' },
              sb: { home: '0', away: '0' },
              so: { home: '0', away: '0' },
            },
            winning_pitcher: {
              first: 'Rich',
              id: '425848',
              last: 'Harden',
              name_display_roster: 'Harden',
              number: '18',
              wins: '2',
              losses: '1',
              era: '4.63',
            },
            losing_pitcher: {
              first: 'A.J.',
              id: '150359',
              last: 'Burnett',
              name_display_roster: 'Burnett',
              number: '34',
              wins: '8',
              losses: '8',
              era: '4.21',
            },
            save_pitcher: {
              first: 'Andrew',
              id: '457732',
              last: 'Bailey',
              name_display_roster: 'Bailey',
              number: '40',
              wins: '0',
              losses: '2',
              era: '2.37',
              saves: '11',
              svo: '13',
            },
            video_thumbnail:
              'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_7_preview.jpg',
            video_thumbnails: {
              thumbnail: [
                {
                  scenario: '7',
                  width: '124',
                  height: '70',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_7_preview.jpg',
                },
                {
                  scenario: '37',
                  width: '160',
                  height: '90',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_37_preview.jpg',
                },
              ],
            },
            game_media: {
              media: {
                type: 'game',
                calendar_event_id: '14-288400-2011-07-23',
                start: '2011-07-23T17:05:00Z',
                title: 'OAK @ NYY',
                has_mlbtv: 'true',
                has_milbtv: 'false',
                thumbnail:
                  'http://mediadownloads.mlb.com/mlbam/preview/oaknya_288400_th_7_preview.jpg',
                free: 'NO',
                enhanced: 'N',
                media_state: 'media_archive',
              },
            },
            id: '2011/07/23/oakmlb-nyamlb-1',
            game_pk: '288400',
            venue: 'Yankee Stadium',
            original_date: '2011/07/23',
            resume_date: '',
            time: '1:05',
            time_date: '2011/07/23 1:05',
            time_date_aw_lg: '2011/07/23 1:05',
            time_date_hm_lg: '2011/07/23 1:05',
            time_zone: 'ET',
            ampm: 'PM',
            first_pitch_et: '',
            away_time: '10:05',
            away_time_zone: 'PT',
            away_ampm: 'AM',
            home_time: '1:05',
            home_time_zone: 'ET',
            home_ampm: 'PM',
            game_type: 'R',
            tiebreaker_sw: 'N',
            time_zone_aw_lg: '-4',
            time_zone_hm_lg: '-4',
            time_aw_lg: '1:05',
            aw_lg_ampm: 'PM',
            tz_aw_lg_gen: 'ET',
            time_hm_lg: '1:05',
            hm_lg_ampm: 'PM',
            tz_hm_lg_gen: 'ET',
            venue_id: '3313',
            stats_season: '2011',
            scheduled_innings: '9',
            description: '',
            series: 'Regular Season',
            ser_home_nbr: '33',
            series_num: '33',
            ser_games: '3',
            home_name_abbrev: 'NYY',
            home_code: 'nya',
            home_file_code: 'nyy',
            home_team_id: '147',
            home_team_city: 'NY Yankees',
            home_team_name: 'Yankees',
            home_division: 'E',
            home_league_id: '103',
            home_sport_code: 'mlb',
            away_name_abbrev: 'OAK',
            away_code: 'oak',
            away_file_code: 'oak',
            away_team_id: '133',
            away_team_city: 'Oakland',
            away_team_name: 'Athletics',
            away_division: 'W',
            away_league_id: '103',
            away_sport_code: 'mlb',
            day: 'SAT',
            gameday_sw: 'P',
            double_header_sw: 'N',
            game_nbr: '1',
            tbd_flag: 'N',
            venue_w_chan_loc: 'USNY0172',
            location: 'Bronx, NY',
            gameday: '2011_07_23_oakmlb_nyamlb_1',
            away_games_back: '',
            away_games_back_wildcard: '',
            away_win: '44',
            away_loss: '56',
            home_games_back: '',
            home_games_back_wildcard: '',
            home_win: '58',
            home_loss: '40',
            game_data_directory:
              '/components/game/mlb/year_2011/month_07/day_23/gid_2011_07_23_oakmlb_nyamlb_1',
            inning_break_length: '',
            league: 'AA',
          },
        ];

        // act
        const results = await _getGamesPlayed(api)(teamCode, today);

        // assert
        expect(results.length).toEqual(expectedResult.length);
        expect(results).toStrictEqual(expectedResult);
      });

      //lan was game in test data was duplicated to simulate a double header
      test('gets two games from results, simulated double header', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((resolve, _reject) => {
              resolve(mlbGamesTestData);
            });
          },
        };
        const today: Date = new Date();
        const teamCode: string = 'lan';
        const expectedResult = [
          {
            links: {
              mlbtv:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'video'})",
              wrapup:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=wrap&c_id=mlb',
              home_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              away_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              home_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              away_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              tv_station: 'PRIME, TWC 858',
            },
            broadcast: {
              home: { tv: 'PRIME, TWC 858', radio: 'KABC 790, KTNQ 1020' },
              away: { tv: 'MASN 2 HD', radio: '106.7 The Fan, WFED 1500' },
            },
            status: {
              status: 'Final',
              ind: 'F',
              inning_state: 'Bottom',
              note: 'One out when winning run scored.',
              reason: '',
              inning: '9',
              balls: '2',
              strikes: '0',
              outs: '1',
              top_inning: 'N',
              is_perfect_game: 'N',
              is_no_hitter: 'N',
            },
            home_runs: {},
            linescore: {
              inning: [
                { home: '1', away: '3' },
                { home: '1', away: '0' },
                { home: '3', away: '3' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
              ],
              r: { home: '7', away: '6', diff: '1' },
              h: { home: '14', away: '9' },
              e: { home: '0', away: '1' },
              hr: { home: '14', away: '13' },
              sb: { home: '0', away: '0' },
              so: { home: '0', away: '0' },
            },
            winning_pitcher: {
              first: 'Javy',
              id: '457915',
              last: 'Guerra',
              name_display_roster: 'Guerra',
              number: '54',
              wins: '2',
              losses: '0',
              era: '2.08',
            },
            losing_pitcher: {
              first: 'Ryan',
              id: '458919',
              last: 'Mattheus',
              name_display_roster: 'Mattheus',
              number: '52',
              wins: '2',
              losses: '2',
              era: '1.89',
            },
            save_pitcher: {
              first: '',
              id: '',
              last: '',
              name_display_roster: '',
              number: '',
              wins: '',
              losses: '',
              era: '',
              saves: '',
              svo: '',
            },
            video_thumbnail:
              'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
            video_thumbnails: {
              thumbnail: [
                {
                  scenario: '7',
                  width: '124',
                  height: '70',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                },
                {
                  scenario: '37',
                  width: '160',
                  height: '90',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_37_preview.jpg',
                },
              ],
            },
            game_media: {
              media: {
                type: 'game',
                calendar_event_id: '14-288406-2011-07-23',
                start: '2011-07-24T02:10:00Z',
                title: 'WSH @ LAD',
                has_mlbtv: 'true',
                has_milbtv: 'false',
                thumbnail:
                  'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                free: 'NO',
                enhanced: 'N',
                media_state: 'media_dead',
              },
            },
            id: '2011/07/23/wasmlb-lanmlb-1',
            game_pk: '288406',
            venue: 'Dodger Stadium',
            original_date: '2011/07/23',
            resume_date: '',
            time: '10:10',
            time_date: '2011/07/23 10:10',
            time_date_aw_lg: '2011/07/23 10:10',
            time_date_hm_lg: '2011/07/23 10:10',
            time_zone: 'ET',
            ampm: 'PM',
            first_pitch_et: '',
            away_time: '10:10',
            away_time_zone: 'ET',
            away_ampm: 'PM',
            home_time: '7:10',
            home_time_zone: 'PT',
            home_ampm: 'PM',
            game_type: 'R',
            tiebreaker_sw: 'N',
            time_zone_aw_lg: '-4',
            time_zone_hm_lg: '-4',
            time_aw_lg: '10:10',
            aw_lg_ampm: 'PM',
            tz_aw_lg_gen: 'ET',
            time_hm_lg: '10:10',
            hm_lg_ampm: 'PM',
            tz_hm_lg_gen: 'ET',
            venue_id: '22',
            stats_season: '2011',
            scheduled_innings: '9',
            description: '',
            series: 'Regular Season',
            ser_home_nbr: '33',
            series_num: '33',
            ser_games: '3',
            home_name_abbrev: 'LAD',
            home_code: 'lan',
            home_file_code: 'la',
            home_team_id: '119',
            home_team_city: 'LA Dodgers',
            home_team_name: 'Dodgers',
            home_division: 'W',
            home_league_id: '104',
            home_sport_code: 'mlb',
            away_name_abbrev: 'WSH',
            away_code: 'was',
            away_file_code: 'was',
            away_team_id: '120',
            away_team_city: 'Washington',
            away_team_name: 'Nationals',
            away_division: 'E',
            away_league_id: '104',
            away_sport_code: 'mlb',
            day: 'SAT',
            gameday_sw: 'P',
            double_header_sw: 'N',
            game_nbr: '1',
            tbd_flag: 'N',
            venue_w_chan_loc: 'USCA0638',
            location: 'Los Angeles, CA',
            gameday: '2011_07_23_wasmlb_lanmlb_1',
            away_games_back: '',
            away_games_back_wildcard: '',
            away_win: '49',
            away_loss: '51',
            home_games_back: '',
            home_games_back_wildcard: '',
            home_win: '44',
            home_loss: '56',
            game_data_directory:
              '/components/game/mlb/year_2011/month_07/day_23/gid_2011_07_23_wasmlb_lanmlb_1',
            inning_break_length: '',
            league: 'NN',
          },
          {
            links: {
              mlbtv:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'video'})",
              wrapup:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=wrap&c_id=mlb',
              home_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              away_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              home_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              away_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              tv_station: 'PRIME, TWC 858',
            },
            broadcast: {
              home: { tv: 'PRIME, TWC 858', radio: 'KABC 790, KTNQ 1020' },
              away: { tv: 'MASN 2 HD', radio: '106.7 The Fan, WFED 1500' },
            },
            status: {
              status: 'Final',
              ind: 'F',
              inning_state: 'Bottom',
              note: 'One out when winning run scored.',
              reason: '',
              inning: '9',
              balls: '2',
              strikes: '0',
              outs: '1',
              top_inning: 'N',
              is_perfect_game: 'N',
              is_no_hitter: 'N',
            },
            home_runs: {},
            linescore: {
              inning: [
                { home: '1', away: '3' },
                { home: '1', away: '0' },
                { home: '3', away: '3' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
              ],
              r: { home: '7', away: '6', diff: '1' },
              h: { home: '14', away: '9' },
              e: { home: '0', away: '1' },
              hr: { home: '14', away: '13' },
              sb: { home: '0', away: '0' },
              so: { home: '0', away: '0' },
            },
            winning_pitcher: {
              first: 'Javy',
              id: '457915',
              last: 'Guerra',
              name_display_roster: 'Guerra',
              number: '54',
              wins: '2',
              losses: '0',
              era: '2.08',
            },
            losing_pitcher: {
              first: 'Ryan',
              id: '458919',
              last: 'Mattheus',
              name_display_roster: 'Mattheus',
              number: '52',
              wins: '2',
              losses: '2',
              era: '1.89',
            },
            save_pitcher: {
              first: '',
              id: '',
              last: '',
              name_display_roster: '',
              number: '',
              wins: '',
              losses: '',
              era: '',
              saves: '',
              svo: '',
            },
            video_thumbnail:
              'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
            video_thumbnails: {
              thumbnail: [
                {
                  scenario: '7',
                  width: '124',
                  height: '70',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                },
                {
                  scenario: '37',
                  width: '160',
                  height: '90',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_37_preview.jpg',
                },
              ],
            },
            game_media: {
              media: {
                type: 'game',
                calendar_event_id: '14-288406-2011-07-23',
                start: '2011-07-24T02:10:00Z',
                title: 'WSH @ LAD',
                has_mlbtv: 'true',
                has_milbtv: 'false',
                thumbnail:
                  'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                free: 'NO',
                enhanced: 'N',
                media_state: 'media_dead',
              },
            },
            id: '2011/07/23/wasmlb-lanmlb-1',
            game_pk: '288406',
            venue: 'Dodger Stadium',
            original_date: '2011/07/23',
            resume_date: '',
            time: '10:10',
            time_date: '2011/07/23 10:10',
            time_date_aw_lg: '2011/07/23 10:10',
            time_date_hm_lg: '2011/07/23 10:10',
            time_zone: 'ET',
            ampm: 'PM',
            first_pitch_et: '',
            away_time: '10:10',
            away_time_zone: 'ET',
            away_ampm: 'PM',
            home_time: '7:10',
            home_time_zone: 'PT',
            home_ampm: 'PM',
            game_type: 'R',
            tiebreaker_sw: 'N',
            time_zone_aw_lg: '-4',
            time_zone_hm_lg: '-4',
            time_aw_lg: '10:10',
            aw_lg_ampm: 'PM',
            tz_aw_lg_gen: 'ET',
            time_hm_lg: '10:10',
            hm_lg_ampm: 'PM',
            tz_hm_lg_gen: 'ET',
            venue_id: '22',
            stats_season: '2011',
            scheduled_innings: '9',
            description: '',
            series: 'Regular Season',
            ser_home_nbr: '33',
            series_num: '33',
            ser_games: '3',
            home_name_abbrev: 'LAD',
            home_code: 'lan',
            home_file_code: 'la',
            home_team_id: '119',
            home_team_city: 'LA Dodgers',
            home_team_name: 'Dodgers',
            home_division: 'W',
            home_league_id: '104',
            home_sport_code: 'mlb',
            away_name_abbrev: 'WSH',
            away_code: 'was',
            away_file_code: 'was',
            away_team_id: '120',
            away_team_city: 'Washington',
            away_team_name: 'Nationals',
            away_division: 'E',
            away_league_id: '104',
            away_sport_code: 'mlb',
            day: 'SAT',
            gameday_sw: 'P',
            double_header_sw: 'N',
            game_nbr: '1',
            tbd_flag: 'N',
            venue_w_chan_loc: 'USCA0638',
            location: 'Los Angeles, CA',
            gameday: '2011_07_23_wasmlb_lanmlb_1',
            away_games_back: '',
            away_games_back_wildcard: '',
            away_win: '49',
            away_loss: '51',
            home_games_back: '',
            home_games_back_wildcard: '',
            home_win: '44',
            home_loss: '56',
            game_data_directory:
              '/components/game/mlb/year_2011/month_07/day_23/gid_2011_07_23_wasmlb_lanmlb_1',
            inning_break_length: '',
            league: 'NN',
          },
        ];

        // act
        const results = await _getGamesPlayed(api)(teamCode, today);

        // assert
        expect(results.length).toEqual(expectedResult.length);
        expect(results).toStrictEqual(expectedResult);
      });

      test('gets two games from results, simulated double header', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((resolve, _reject) => {
              resolve(mlbGamesTestData);
            });
          },
        };
        const today: Date = new Date();
        const teamCode: string = 'lan';
        const expectedResult = [
          {
            links: {
              mlbtv:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'video'})",
              wrapup:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=wrap&c_id=mlb',
              home_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              away_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              home_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              away_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              tv_station: 'PRIME, TWC 858',
            },
            broadcast: {
              home: { tv: 'PRIME, TWC 858', radio: 'KABC 790, KTNQ 1020' },
              away: { tv: 'MASN 2 HD', radio: '106.7 The Fan, WFED 1500' },
            },
            status: {
              status: 'Final',
              ind: 'F',
              inning_state: 'Bottom',
              note: 'One out when winning run scored.',
              reason: '',
              inning: '9',
              balls: '2',
              strikes: '0',
              outs: '1',
              top_inning: 'N',
              is_perfect_game: 'N',
              is_no_hitter: 'N',
            },
            home_runs: {},
            linescore: {
              inning: [
                { home: '1', away: '3' },
                { home: '1', away: '0' },
                { home: '3', away: '3' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
              ],
              r: { home: '7', away: '6', diff: '1' },
              h: { home: '14', away: '9' },
              e: { home: '0', away: '1' },
              hr: { home: '14', away: '13' },
              sb: { home: '0', away: '0' },
              so: { home: '0', away: '0' },
            },
            winning_pitcher: {
              first: 'Javy',
              id: '457915',
              last: 'Guerra',
              name_display_roster: 'Guerra',
              number: '54',
              wins: '2',
              losses: '0',
              era: '2.08',
            },
            losing_pitcher: {
              first: 'Ryan',
              id: '458919',
              last: 'Mattheus',
              name_display_roster: 'Mattheus',
              number: '52',
              wins: '2',
              losses: '2',
              era: '1.89',
            },
            save_pitcher: {
              first: '',
              id: '',
              last: '',
              name_display_roster: '',
              number: '',
              wins: '',
              losses: '',
              era: '',
              saves: '',
              svo: '',
            },
            video_thumbnail:
              'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
            video_thumbnails: {
              thumbnail: [
                {
                  scenario: '7',
                  width: '124',
                  height: '70',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                },
                {
                  scenario: '37',
                  width: '160',
                  height: '90',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_37_preview.jpg',
                },
              ],
            },
            game_media: {
              media: {
                type: 'game',
                calendar_event_id: '14-288406-2011-07-23',
                start: '2011-07-24T02:10:00Z',
                title: 'WSH @ LAD',
                has_mlbtv: 'true',
                has_milbtv: 'false',
                thumbnail:
                  'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                free: 'NO',
                enhanced: 'N',
                media_state: 'media_dead',
              },
            },
            id: '2011/07/23/wasmlb-lanmlb-1',
            game_pk: '288406',
            venue: 'Dodger Stadium',
            original_date: '2011/07/23',
            resume_date: '',
            time: '10:10',
            time_date: '2011/07/23 10:10',
            time_date_aw_lg: '2011/07/23 10:10',
            time_date_hm_lg: '2011/07/23 10:10',
            time_zone: 'ET',
            ampm: 'PM',
            first_pitch_et: '',
            away_time: '10:10',
            away_time_zone: 'ET',
            away_ampm: 'PM',
            home_time: '7:10',
            home_time_zone: 'PT',
            home_ampm: 'PM',
            game_type: 'R',
            tiebreaker_sw: 'N',
            time_zone_aw_lg: '-4',
            time_zone_hm_lg: '-4',
            time_aw_lg: '10:10',
            aw_lg_ampm: 'PM',
            tz_aw_lg_gen: 'ET',
            time_hm_lg: '10:10',
            hm_lg_ampm: 'PM',
            tz_hm_lg_gen: 'ET',
            venue_id: '22',
            stats_season: '2011',
            scheduled_innings: '9',
            description: '',
            series: 'Regular Season',
            ser_home_nbr: '33',
            series_num: '33',
            ser_games: '3',
            home_name_abbrev: 'LAD',
            home_code: 'lan',
            home_file_code: 'la',
            home_team_id: '119',
            home_team_city: 'LA Dodgers',
            home_team_name: 'Dodgers',
            home_division: 'W',
            home_league_id: '104',
            home_sport_code: 'mlb',
            away_name_abbrev: 'WSH',
            away_code: 'was',
            away_file_code: 'was',
            away_team_id: '120',
            away_team_city: 'Washington',
            away_team_name: 'Nationals',
            away_division: 'E',
            away_league_id: '104',
            away_sport_code: 'mlb',
            day: 'SAT',
            gameday_sw: 'P',
            double_header_sw: 'N',
            game_nbr: '1',
            tbd_flag: 'N',
            venue_w_chan_loc: 'USCA0638',
            location: 'Los Angeles, CA',
            gameday: '2011_07_23_wasmlb_lanmlb_1',
            away_games_back: '',
            away_games_back_wildcard: '',
            away_win: '49',
            away_loss: '51',
            home_games_back: '',
            home_games_back_wildcard: '',
            home_win: '44',
            home_loss: '56',
            game_data_directory:
              '/components/game/mlb/year_2011/month_07/day_23/gid_2011_07_23_wasmlb_lanmlb_1',
            inning_break_length: '',
            league: 'NN',
          },
          {
            links: {
              mlbtv:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'video'})",
              wrapup:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=wrap&c_id=mlb',
              home_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              away_audio:
                "bam.media.launchPlayer({calendar_event_id:'14-288406-2011-07-23',media_type:'audio'})",
              home_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              away_preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              preview:
                '/mlb/gameday/index.jsp?gid=2011_07_23_wasmlb_lanmlb_1&mode=preview&c_id=mlb',
              tv_station: 'PRIME, TWC 858',
            },
            broadcast: {
              home: { tv: 'PRIME, TWC 858', radio: 'KABC 790, KTNQ 1020' },
              away: { tv: 'MASN 2 HD', radio: '106.7 The Fan, WFED 1500' },
            },
            status: {
              status: 'Final',
              ind: 'F',
              inning_state: 'Bottom',
              note: 'One out when winning run scored.',
              reason: '',
              inning: '9',
              balls: '2',
              strikes: '0',
              outs: '1',
              top_inning: 'N',
              is_perfect_game: 'N',
              is_no_hitter: 'N',
            },
            home_runs: {},
            linescore: {
              inning: [
                { home: '1', away: '3' },
                { home: '1', away: '0' },
                { home: '3', away: '3' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
                { home: '0', away: '0' },
                { home: '1', away: '0' },
              ],
              r: { home: '7', away: '6', diff: '1' },
              h: { home: '14', away: '9' },
              e: { home: '0', away: '1' },
              hr: { home: '14', away: '13' },
              sb: { home: '0', away: '0' },
              so: { home: '0', away: '0' },
            },
            winning_pitcher: {
              first: 'Javy',
              id: '457915',
              last: 'Guerra',
              name_display_roster: 'Guerra',
              number: '54',
              wins: '2',
              losses: '0',
              era: '2.08',
            },
            losing_pitcher: {
              first: 'Ryan',
              id: '458919',
              last: 'Mattheus',
              name_display_roster: 'Mattheus',
              number: '52',
              wins: '2',
              losses: '2',
              era: '1.89',
            },
            save_pitcher: {
              first: '',
              id: '',
              last: '',
              name_display_roster: '',
              number: '',
              wins: '',
              losses: '',
              era: '',
              saves: '',
              svo: '',
            },
            video_thumbnail:
              'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
            video_thumbnails: {
              thumbnail: [
                {
                  scenario: '7',
                  width: '124',
                  height: '70',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                },
                {
                  scenario: '37',
                  width: '160',
                  height: '90',
                  text:
                    'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_37_preview.jpg',
                },
              ],
            },
            game_media: {
              media: {
                type: 'game',
                calendar_event_id: '14-288406-2011-07-23',
                start: '2011-07-24T02:10:00Z',
                title: 'WSH @ LAD',
                has_mlbtv: 'true',
                has_milbtv: 'false',
                thumbnail:
                  'http://mediadownloads.mlb.com/mlbam/preview/waslan_288406_th_7_preview.jpg',
                free: 'NO',
                enhanced: 'N',
                media_state: 'media_dead',
              },
            },
            id: '2011/07/23/wasmlb-lanmlb-1',
            game_pk: '288406',
            venue: 'Dodger Stadium',
            original_date: '2011/07/23',
            resume_date: '',
            time: '10:10',
            time_date: '2011/07/23 10:10',
            time_date_aw_lg: '2011/07/23 10:10',
            time_date_hm_lg: '2011/07/23 10:10',
            time_zone: 'ET',
            ampm: 'PM',
            first_pitch_et: '',
            away_time: '10:10',
            away_time_zone: 'ET',
            away_ampm: 'PM',
            home_time: '7:10',
            home_time_zone: 'PT',
            home_ampm: 'PM',
            game_type: 'R',
            tiebreaker_sw: 'N',
            time_zone_aw_lg: '-4',
            time_zone_hm_lg: '-4',
            time_aw_lg: '10:10',
            aw_lg_ampm: 'PM',
            tz_aw_lg_gen: 'ET',
            time_hm_lg: '10:10',
            hm_lg_ampm: 'PM',
            tz_hm_lg_gen: 'ET',
            venue_id: '22',
            stats_season: '2011',
            scheduled_innings: '9',
            description: '',
            series: 'Regular Season',
            ser_home_nbr: '33',
            series_num: '33',
            ser_games: '3',
            home_name_abbrev: 'LAD',
            home_code: 'lan',
            home_file_code: 'la',
            home_team_id: '119',
            home_team_city: 'LA Dodgers',
            home_team_name: 'Dodgers',
            home_division: 'W',
            home_league_id: '104',
            home_sport_code: 'mlb',
            away_name_abbrev: 'WSH',
            away_code: 'was',
            away_file_code: 'was',
            away_team_id: '120',
            away_team_city: 'Washington',
            away_team_name: 'Nationals',
            away_division: 'E',
            away_league_id: '104',
            away_sport_code: 'mlb',
            day: 'SAT',
            gameday_sw: 'P',
            double_header_sw: 'N',
            game_nbr: '1',
            tbd_flag: 'N',
            venue_w_chan_loc: 'USCA0638',
            location: 'Los Angeles, CA',
            gameday: '2011_07_23_wasmlb_lanmlb_1',
            away_games_back: '',
            away_games_back_wildcard: '',
            away_win: '49',
            away_loss: '51',
            home_games_back: '',
            home_games_back_wildcard: '',
            home_win: '44',
            home_loss: '56',
            game_data_directory:
              '/components/game/mlb/year_2011/month_07/day_23/gid_2011_07_23_wasmlb_lanmlb_1',
            inning_break_length: '',
            league: 'NN',
          },
        ];

        // act
        const results = await _getGamesPlayed(api)(teamCode, today);

        // assert
        expect(results.length).toEqual(expectedResult.length);
        expect(results).toStrictEqual(expectedResult);
      });
    });

    describe('sad path', () => {
      test('invalid teamCode', async () => {
        // arrange
        const api: IMLBApi = {
          get: function(_date: Date): Promise<any[]> {
            return new Promise((resolve, _reject) => {
              resolve([]);
            });
          },
        };
        const today: Date = new Date();
        const teamCode: string = 'this can be any INVALID code';
        expect.assertions(2);

        // act
        try {
          await _getGamesPlayed(api)(teamCode, today);
        } catch (error) {
          // assert
          expect(error).toBeDefined();
          expect(error).toEqual(
            new Error(`Invalid team code 'this can be any INVALID code'`)
          );
        }
      });
    });
  });

  describe('getGamesPlayed() integration tests', () => {
    test('exists', () => {
      expect(getGamesPlayed).toBeDefined();
    });

    //use random dates to test, make sure double header is tested
    test('min vs bal 04/20/2019, double header, teamCode = min', async () => {
      // arrange
      const teamCodeMinnesota: string = 'min';
      const date: Date = new Date('April 20, 2019');

      // act
      const results = await getGamesPlayed(teamCodeMinnesota, date);

      // assert
      expect(results).toHaveLength(2);
    });

    test('min vs bal 04/20/2019, double header, teamCode = bal', async () => {
      // arrange
      const teamCodeBaltimore: string = 'bal';
      const date: Date = new Date('April 20, 2019');

      // act
      const results = await getGamesPlayed(teamCodeBaltimore, date);

      // assert
      expect(results).toHaveLength(2);
    });

    test('a date where no games were played', async () => {
      // arrange
      const teamCode: string = 'ana'; //can be anything, but has to be valid for test
      const outOfSeasonDate: Date = new Date('March 28, 2018');

      // act
      const results = await getGamesPlayed(teamCode, outOfSeasonDate);

      // assert
      expect(results).toStrictEqual([]);
    });

    test('a date where the yankees played one game', async () => {
      // arrange
      const teamCodeYankees: string = 'nya';
      const date: Date = new Date('April 02, 2017');

      // act
      const results = await getGamesPlayed(teamCodeYankees, date);

      // assert
      expect(results).toHaveLength(1);
    });
  });
});
