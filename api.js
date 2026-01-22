const Soup = imports.gi.Soup;
const GLib = imports.gi.GLib;

export default class ApiClient {
  constructor() {
    this._baseUrl = "https://hexarate.paikama.co/api";
    this._session = new Soup.Session();
  }

  _buildUrl(base, target, date) {
    return `${this._baseUrl}/rates/${base}/${target}/${date}`;
  }

  async fetchRate(base, target, date = "latest") {
    const url = this._buildUrl(base, target, date);
    const request = Soup.Message.new("GET", url);
    request.request_headers.set_content_type("application/json", null);

    return new Promise((resolve, reject) => {
      this._session.send_and_read_async(
        request,
        GLib.PRIORITY_DEFAULT,
        null,
        (session, result) => {
          try {
            const body = session.send_and_read_finish(result);
            const text = body.get_data().toString();
            const data = JSON.parse(text);
            resolve(data.data.mid.toFixed(2));
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  destroy() {
    if (this._session) {
      this._session.abort();
      this._session = null;
    }
  }
}
