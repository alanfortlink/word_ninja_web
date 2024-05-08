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
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getGameplays(){
    const response = await fetch(`${baseUrl}/top10Week`);
    const gameplays = await response.json();

    for (let i = 0; i < gameplays.length; i++) {
      for (let j = 0; j < gameplays[i].events.length; j++) {
        const event = gameplays[i].events[j];
        event.duration = Math.max(0.016, event.duration);
      }
    }

    return gameplays;
  }

  static async getStats(score){
    const response = await fetch(`${baseUrl}/stats/${score}`);
    const stats = await response.json();
    return stats;
  }

}

export { Network }
