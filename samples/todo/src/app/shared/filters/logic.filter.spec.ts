import { LogicFilter } from './logic.filter';
import { LogicException } from '../exceptions/logic.exception';

describe('LogicFilter', () => {
  let filter: LogicFilter<LogicException>;
  let error: jest.Mock;
  const request = {
    url: '/an/url',
  };
  const exception = new LogicException('Logic error', 'id001');
  const jsonFn = jest.fn();
  const status = jest.fn(() => {
    return {
      json: jsonFn,
    };
  });
  const argumentHost = {
    switchToHttp() {
      return {
        getResponse() {
          return {
            status,
          };
        },
        getRequest() {
          return request;
        },
      };
    },
  };

  beforeAll(() => {
    error = jest.fn();
    const logger = {
      error,
    };
    filter = new LogicFilter(logger as any);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should return an 400 Bad Request error', () => {
      filter.catch(exception, argumentHost as any);
      expect(error).toBeCalledTimes(1);
      expect(status).toBeCalledWith(400);
      expect(jsonFn).toBeCalledWith({
        ...exception.plainObject(),
        statusCode: 400,
        timestamp: jsonFn.mock.calls[0][0].timestamp,
        path: request.url,
      });
    });

    it('should also work without logger', () => {
      const newFilter = new LogicFilter();

      newFilter.catch(new LogicException('Logic error', 'id001'), argumentHost as any);
    });
  });
});
