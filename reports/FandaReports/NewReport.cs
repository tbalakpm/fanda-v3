using System;
using QuestPDF.Companion;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FandaReports;

public class NewReport
{
  public void CreateReport()
  {
    // code in your main method
    Document.Create(container =>
   {
     container.Page(page =>
     {
       page.Size(PageSizes.A4);
       page.Margin(2, Unit.Centimetre);
       page.PageColor(Colors.White);
       page.DefaultTextStyle(x => x.FontSize(15));

       page.Header()
       .Text("Hello PDF!")
       .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

       page.Content()
       .PaddingVertical(1, Unit.Centimetre)
       .Column(x =>
       {
         x.Spacing(20);

         x.Item().Text(Placeholders.LoremIpsum());
         x.Item().Image(Placeholders.Image(200, 100));
       });

       page.Footer()
       .AlignCenter()
       .Text(x =>
       {
         x.Span("Page ").FontSize(12);
         x.CurrentPageNumber().FontSize(12);
       });
     });
   })
   .ShowInCompanion();
    //.GeneratePdf("./hello.pdf");
  }
}
