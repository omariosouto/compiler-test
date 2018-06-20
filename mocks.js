global.counter = 0

global.payload = {
    code: `
    public class Teste {
        public static void main(String[] args) {
            new Teste3().teste();
            while(true) {
                System.out.println("Hello PANCO!!!");
            }
        } 
    }
    
    class Teste3 {
        public void teste() {
            System.out.println("Hello fodac do teste3!");
        } 
    }`,
    language: 'java'
}

global.payload2 = {
    code: `
        const myArr = [1,2,3,4,5,6,7,8,9,10]
        const msg = 'alo alo w brazil'
        console.log('JS FTW');
        console.log(msg);
        let number = 0;
        while(true) {
            console.log('number: ' + number++)
        }
        
    `,
    language: 'javascript'
}