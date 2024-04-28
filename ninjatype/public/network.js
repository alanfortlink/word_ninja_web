const baseUrl = 'https://ninjaty.pe/api'
// const baseUrl = 'http://localhost:8080/api'

class Network {

  static async publish(gameplay){
    const p = fetch(`${baseUrl}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameplay)
    });

    try {
      const response = await p;
      console.log(response);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getGameplays(){
    const response = await fetch(`${baseUrl}/top10Week`);
    const gameplays = await response.json();
    return gameplays;
  }

}

export { Network }
