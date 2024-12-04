interface IGifCategory {
  name: string;
  name_encoded: string;
  gif: {
    images: {[key: string]: any};
  };
}

interface IGif {
  images: {[key: string]: any};
  id: string;
  title: string;
}

interface IGifData {
  data: IGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  }
}

export {
  IGifCategory,
  IGif,
  IGifData
}